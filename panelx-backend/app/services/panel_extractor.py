"""
DXF panel extractor — production implementation.

Algorithm
---------
Pass 0 (Label scan)
  Scan every TEXT entity in model-space to build two spatial indices:

  floor_labels  – TEXT entities whose text matches "eunv N" (the DXF
                  encoding of the Hebrew "קומה N" = Floor N label that the
                  Israeli CAD operator places on each floor level line).
                  Each label stores (floor_number, x, y).

  area_labels   – TEXT entities on the '!dim' annotation layer whose text
                  matches [NSEW]\\d* (e.g. "W2", "N1", "S1", "E2").
                  The leading letter maps to a compass direction (West/North/
                  South/East).  Each label stores (direction, x, y).

Pass 1 (INSERT sweep)
  For every INSERT entity in model-space that matches the configured block
  patterns, extract inline ATTRIBs.  Map recognised tags to system fields
  (panel_id, floor, area, work_order, date).  If floor/area still null after
  ATTRIB mapping, fall back to the spatial label indices.

Pass 2 (ATTDEF / facade-marker sweep)
  Some facade drawings use top-level ATTDEF entities in model-space (not inside
  any INSERT) whose tag starts with "PN_PL_" or "PB_" as panel-position markers.
  These are collected as additional panel rows.  floor and area are assigned
  entirely from the spatial label indices.

Attribute mapping
  ATTRIBUTE_MAP supports both English and Hebrew synonyms.  Tags are matched
  case-insensitively.  First match wins (no overwrite).

Error resilience
  Each ATTRIB is wrapped in its own try/except so one corrupt entity never
  silently drops the whole INSERT.  All non-fatal issues are collected in the
  warnings list returned to the caller.
"""
from __future__ import annotations

import logging
import math
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ── Attribute → system-field mapping ──────────────────────────────────────────

ATTRIBUTE_MAP: Dict[str, str] = {
    # panel_id
    "PANEL_ID": "panel_id",
    "PNL_ID": "panel_id",
    "ID": "panel_id",
    "PANEL": "panel_id",
    "מזהה": "panel_id",
    # floor
    "FLOOR": "floor",
    "LEVEL": "floor",
    "FL": "floor",
    "קומה": "floor",
    # area / zone
    "AREA": "area",
    "ZONE": "area",
    "ROOM": "area",
    "SECTOR": "area",
    "REGION": "area",
    "אזור": "area",
    # work_order
    "WORK_ORDER": "work_order",
    "WO": "work_order",
    "ORDER": "work_order",
    "WORKORDER": "work_order",
    "הזמנה": "work_order",
    # date
    "DATE": "date",
    "INSTALL_DATE": "date",
    "INST_DATE": "date",
    "תאריך": "date",
}

# Facade-marker ATTDEF tag prefixes (Pass 2)
_FACADE_PREFIXES = ("PN_PL_", "PB_")

# "eunv N" = corrupted-encoding of Hebrew "קומה N" (Floor N)
_FLOOR_LABEL_RE = re.compile(r"eunv\s+(\d+)", re.IGNORECASE)

# Area abbreviations: [NSEW] followed by optional digit(s), e.g. "W2", "N1"
_AREA_LABEL_RE = re.compile(r"^([NSEW])(\d*)$", re.IGNORECASE)
_AREA_ABBR: Dict[str, str] = {
    "N": "North", "S": "South", "E": "East", "W": "West"
}


# ── Pass 0: spatial label indices ─────────────────────────────────────────────

def _build_floor_label_index(msp) -> List[Tuple[int, float, float]]:
    """Scan model-space TEXT entities for 'eunv N' floor level labels.

    Returns a list of (floor_number, x, y) sorted by Y ascending.
    """
    labels: List[Tuple[int, float, float]] = []
    for entity in msp:
        if entity.dxftype() != "TEXT":
            continue
        text = (getattr(entity.dxf, "text", "") or "").strip()
        m = _FLOOR_LABEL_RE.search(text)
        if not m:
            continue
        try:
            pos = entity.dxf.insert
            labels.append((int(m.group(1)), float(pos.x), float(pos.y)))
        except Exception:
            pass
    labels.sort(key=lambda t: t[2])  # ascending Y
    return labels


def _build_area_label_index(msp) -> List[Tuple[str, float, float]]:
    """Scan model-space TEXT entities for area labels like 'W2', 'N1', 'S1'.

    Also accepts full words 'North', 'South', 'East', 'West' (any case).
    Returns a list of (direction_name, x, y).
    """
    labels: List[Tuple[str, float, float]] = []
    for entity in msp:
        if entity.dxftype() != "TEXT":
            continue
        text = (getattr(entity.dxf, "text", "") or "").strip()
        try:
            pos = entity.dxf.insert
            x, y = float(pos.x), float(pos.y)
        except Exception:
            continue

        # Full compass word
        lower = text.lower()
        if lower in ("north", "south", "east", "west"):
            labels.append((lower.capitalize(), x, y))
            continue

        # [NSEW]\d* abbreviation
        m = _AREA_LABEL_RE.fullmatch(text)
        if m:
            direction = _AREA_ABBR.get(m.group(1).upper())
            if direction:
                labels.append((direction, x, y))
    return labels


def _floor_from_labels(
    pos_y: float,
    floor_labels: List[Tuple[int, float, float]],
    max_distance: float = 5000.0,
) -> Optional[str]:
    """Find the nearest floor label by Y distance.

    *max_distance* prevents assigning a floor to a panel that is far outside
    all labelled floor bands.
    """
    if not floor_labels:
        return None
    best = min(floor_labels, key=lambda t: abs(t[2] - pos_y))
    if abs(best[2] - pos_y) > max_distance:
        return None
    return str(best[0])


def _area_from_labels(
    pos_x: float,
    pos_y: float,
    area_labels: List[Tuple[str, float, float]],
    max_distance: float = 30_000.0,
) -> Optional[str]:
    """Find the nearest area label by weighted (X-heavy) distance.

    X is weighted 5× relative to Y because area sections are laid out side
    by side (X axis) while floors are stacked (Y axis).
    """
    if not area_labels:
        return None
    best = min(area_labels, key=lambda t: abs(t[1] - pos_x) * 5 + abs(t[2] - pos_y))
    dist_x = abs(best[1] - pos_x)
    if dist_x > max_distance:
        return None
    return best[0]


# ── Block-name floor inference (fallback) ─────────────────────────────────────

def _floor_from_block_name(block_name: str) -> Optional[str]:
    m = re.search(r"floor[_ ]+([\w]+)", block_name, re.IGNORECASE)
    if m:
        return m.group(1).lstrip("0") or "0"
    m = re.search(r"[-_]F(\d+)[-_]", block_name, re.IGNORECASE)
    if m:
        return m.group(1)
    m = re.search(r"level[_ ]+([\w]+)", block_name, re.IGNORECASE)
    if m:
        return m.group(1).lstrip("0") or "0"
    return None


# ── Block local bounding box (cached per doc) ──────────────────────────────────

def _block_local_bounds(doc, block_name: str) -> Optional[Tuple[float, float, float, float]]:
    """Compute the local bounding box of a block definition (cached).

    Handles LINE (start/end), ARC (center), INSERT (insert), CIRCLE (center),
    LWPOLYLINE (get_points), and POLYLINE (vertices).
    """
    cache = getattr(doc, "_block_bounds_cache", None)
    if cache is None:
        cache = {}
        doc._block_bounds_cache = cache  # type: ignore[attr-defined]
    if block_name in cache:
        return cache[block_name]

    try:
        block = doc.blocks.get(block_name)
    except Exception:
        cache[block_name] = None
        return None

    minx = miny = float("inf")
    maxx = maxy = float("-inf")
    found = False

    for e in block:
        pts: List[Tuple[float, float]] = []
        dxf = getattr(e, "dxf", None)
        if dxf is not None:
            for attr in ("insert", "start", "end", "center"):
                p = getattr(dxf, attr, None)
                if p is not None and hasattr(p, "x"):
                    pts.append((float(p.x), float(p.y)))
        # LWPOLYLINE — vertices via get_points()
        if e.dxftype() == "LWPOLYLINE":
            try:
                for v in e.get_points():
                    pts.append((float(v[0]), float(v[1])))
            except Exception:
                pass
        # Regular POLYLINE — vertices have .dxf.location
        elif hasattr(e, "vertices"):
            try:
                for v in e.vertices:
                    p = getattr(v, "dxf", v)
                    loc = getattr(p, "location", None)
                    if loc is not None and hasattr(loc, "x"):
                        pts.append((float(loc.x), float(loc.y)))
            except Exception:
                pass
        for x, y in pts:
            minx, miny = min(minx, x), min(miny, y)
            maxx, maxy = max(maxx, x), max(maxy, y)
            found = True

    result = (minx, miny, maxx, maxy) if found else None
    cache[block_name] = result
    return result


def _world_bbox(
    position,
    scale_x: float,
    scale_y: float,
    rotation: float,
    local_bounds: Tuple[float, float, float, float],
) -> Dict[str, float]:
    """Transform a block-local bounding box to world coordinates."""
    lminx, lminy, lmaxx, lmaxy = local_bounds
    corners = [
        (lminx, lminy), (lmaxx, lminy),
        (lmaxx, lmaxy), (lminx, lmaxy),
    ]
    rad = math.radians(rotation)
    cos_r, sin_r = math.cos(rad), math.sin(rad)
    ox, oy = float(position.x), float(position.y)
    wxs: List[float] = []
    wys: List[float] = []
    for lx, ly in corners:
        sx, sy = lx * scale_x, ly * scale_y
        wxs.append(ox + sx * cos_r - sy * sin_r)
        wys.append(oy + sx * sin_r + sy * cos_r)
    return {
        "minX": round(min(wxs), 2),
        "minY": round(min(wys), 2),
        "maxX": round(max(wxs), 2),
        "maxY": round(max(wys), 2),
    }


# ── ATTRIB extraction ──────────────────────────────────────────────────────────

def _extract_attribs(insert) -> Dict[str, str]:
    """Return {TAG: text} for every ATTRIB attached to *insert*.

    Each individual ATTRIB is wrapped in its own try/except.
    """
    raw: Dict[str, str] = {}
    try:
        attribs = insert.attribs
    except Exception:
        return raw
    for attrib in attribs:
        try:
            tag = (attrib.dxf.tag or "").strip().upper()
            text_val = attrib.dxf.text
            text = text_val.strip() if text_val is not None else ""
            if tag:
                raw[tag] = text
        except Exception as exc:
            logger.debug("Skipping malformed ATTRIB: %s", exc)
    return raw


def _map_attributes(raw: Dict[str, str]) -> Dict[str, Optional[str]]:
    """Map raw DXF {TAG: value} pairs to system field names.

    First match wins; only non-empty values are stored.
    """
    mapped: Dict[str, Optional[str]] = {
        "panel_id": None,
        "floor": None,
        "area": None,
        "work_order": None,
        "date": None,
    }
    for tag, value in raw.items():
        field = ATTRIBUTE_MAP.get(tag.upper())
        if field and value and mapped.get(field) is None:
            mapped[field] = value
    return mapped


def _matches_pattern(block_name: str, patterns: List[str]) -> bool:
    if not patterns:
        return True
    upper = block_name.upper()
    return any(p.upper() in upper for p in patterns)


# ── Public API ─────────────────────────────────────────────────────────────────

def extract_panels_from_dxf(
    dxf_path: Path,
    block_patterns: Optional[List[str]] = None,
) -> Tuple[List[Dict[str, Any]], List[str], List[str]]:
    """Extract panel data from a DXF file.

    Parameters
    ----------
    dxf_path:
        Path to the .dxf file on disk.
    block_patterns:
        Optional list of substrings to match against INSERT block names
        (case-insensitive).  Empty / None -> accept every INSERT.

    Returns
    -------
    panels, warnings, errors
        panels: list of dicts ready for ``Panel(**p)`` ORM construction.
        Each dict contains: panel_id, floor, area, work_order, date,
        position_x, position_y, entity_handle, block_name, layer,
        raw_attributes (includes '_bbox' when computable), source.
    """
    try:
        import ezdxf
    except ImportError as exc:
        return [], [], [f"ezdxf not installed: {exc}"]

    patterns = block_patterns or []
    panels: List[Dict[str, Any]] = []
    warnings: List[str] = []
    errors: List[str] = []

    try:
        doc = ezdxf.readfile(str(dxf_path))
    except Exception as exc:
        return [], [], [f"Failed to read DXF file: {exc}"]

    msp = doc.modelspace()

    # ── Pass 0: build spatial label indices ───────────────────────────────────
    floor_labels = _build_floor_label_index(msp)
    area_labels  = _build_area_label_index(msp)

    if floor_labels:
        unique_floors = sorted({fl for fl, _, _ in floor_labels})
        logger.info(
            "[DIAG] %d floor labels found — floors: %s",
            len(floor_labels), unique_floors,
        )
    else:
        logger.warning("[DIAG] No 'eunv N' floor labels found in %s.", Path(dxf_path).name)

    if area_labels:
        unique_areas = sorted({a for a, _, _ in area_labels})
        logger.info(
            "[DIAG] %d area labels found — areas: %s",
            len(area_labels), unique_areas,
        )
    else:
        logger.warning("[DIAG] No area labels (W1/N1/etc.) found in %s.", Path(dxf_path).name)

    seen_handles: set = set()

    # ── Pass 1: INSERT entities with ATTRIBs ──────────────────────────────────
    for entity in msp:
        if entity.dxftype() != "INSERT":
            continue

        block_name: str = entity.dxf.get("name", "") or ""
        if not _matches_pattern(block_name, patterns):
            continue

        handle: str = entity.dxf.handle or ""
        if handle and handle in seen_handles:
            warnings.append(f"Duplicate handle {handle} in block {block_name!r}; skipped")
            continue
        if handle:
            seen_handles.add(handle)

        try:
            pos = entity.dxf.insert
            pos_x: Optional[float] = round(float(pos.x), 4)
            pos_y: Optional[float] = round(float(pos.y), 4)
        except Exception:
            pos = None
            pos_x = pos_y = None

        layer: str = entity.dxf.get("layer", "") or ""
        raw = _extract_attribs(entity)
        if not raw:
            continue

        mapped = _map_attributes(raw)

        # panel_id fallback: entity handle
        if not mapped["panel_id"]:
            mapped["panel_id"] = handle or block_name
            warnings.append(
                f"Block {block_name!r} (handle {handle}): panel_id not in attributes; "
                f"using handle. Unrecognised tags: {sorted(raw.keys())}"
            )

        # floor: ATTRIB first, then spatial labels, then block-name heuristic
        if not mapped["floor"] and pos_y is not None:
            mapped["floor"] = _floor_from_labels(pos_y, floor_labels)
        if not mapped["floor"]:
            mapped["floor"] = _floor_from_block_name(block_name)

        # area: ATTRIB first, then spatial labels
        if not mapped["area"] and pos_x is not None and pos_y is not None:
            mapped["area"] = _area_from_labels(pos_x, pos_y, area_labels)

        # Bounding box
        raw_with_bbox = dict(raw)
        if pos is not None:
            local_bounds = _block_local_bounds(doc, block_name)
            if local_bounds:
                try:
                    sx = float(getattr(entity.dxf, "xscale", 1.0))
                    sy = float(getattr(entity.dxf, "yscale", 1.0))
                    rot = float(getattr(entity.dxf, "rotation", 0.0))
                    raw_with_bbox["_bbox"] = _world_bbox(pos, sx, sy, rot, local_bounds)
                except Exception as exc:
                    logger.debug("bbox failed for handle %s: %s", handle, exc)

        panels.append({
            "panel_id": mapped["panel_id"] or "",
            "floor": mapped["floor"] or None,
            "area": mapped["area"] or None,
            "work_order": mapped["work_order"] or None,
            "date": mapped["date"] or None,
            "position_x": pos_x,
            "position_y": pos_y,
            "entity_handle": handle or None,
            "block_name": block_name or None,
            "layer": layer or None,
            "raw_attributes": raw_with_bbox,
            "source": "dwg",
        })

    # ── Pass 2: Modelspace ATTDEF facade markers ──────────────────────────────
    for entity in msp:
        if entity.dxftype() != "ATTDEF":
            continue
        tag = (getattr(entity.dxf, "tag", "") or "").strip()
        if not any(tag.startswith(pfx) for pfx in _FACADE_PREFIXES):
            continue

        try:
            pos = entity.dxf.insert
            pos_x = round(float(pos.x), 4)
            pos_y = round(float(pos.y), 4)
        except Exception:
            pos_x = pos_y = None

        text_val = (getattr(entity.dxf, "text", "") or "").strip()
        layer = (entity.dxf.get("layer", "") or "") or None
        att_handle = entity.dxf.handle or ""

        # Floor and area from spatial label indices
        floor_val: Optional[str] = None
        area_val: Optional[str] = None
        if pos_y is not None:
            floor_val = _floor_from_labels(pos_y, floor_labels)
        if pos_x is not None and pos_y is not None:
            area_val = _area_from_labels(pos_x, pos_y, area_labels)

        panels.append({
            "panel_id": tag,
            "floor": floor_val,
            "area": area_val,
            "work_order": text_val or None,
            "date": None,
            "position_x": pos_x,
            "position_y": pos_y,
            "entity_handle": att_handle or None,
            "block_name": "ATTDEF",
            "layer": layer,
            "raw_attributes": {"tag": tag, "text": text_val},
            "source": "dwg",
        })

    # ── Diagnostics ───────────────────────────────────────────────────────────
    unique_tags: set = set()
    for p in panels:
        ra = p.get("raw_attributes") or {}
        unique_tags.update(k for k in ra if not k.startswith("_"))

    if unique_tags:
        logger.info("[DIAG] All ATTRIB tags in %s: %s", Path(dxf_path).name, sorted(unique_tags))
    else:
        logger.warning("[DIAG] No ATTRIB tags found in %s.", Path(dxf_path).name)

    # Floor/area coverage report
    floor_filled  = sum(1 for p in panels if p.get("floor"))
    area_filled   = sum(1 for p in panels if p.get("area"))
    logger.info(
        "[DIAG] Coverage: %d/%d panels have floor, %d/%d have area",
        floor_filled, len(panels), area_filled, len(panels),
    )

    logger.info(
        "Extracted %d panels from %s (%d warnings, %d errors)",
        len(panels), Path(dxf_path).name, len(warnings), len(errors),
    )
    return panels, warnings, errors
