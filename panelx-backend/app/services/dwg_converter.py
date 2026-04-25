"""
DWG → DXF converter service.

Tries converters in order: ODA → LibreDWG → passthrough (if already DXF).
All heavy I/O is synchronous (runs inside a Celery worker or a thread executor).
"""
from __future__ import annotations

import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Exceptions ─────────────────────────────────────────────────────────────────


class ConversionError(RuntimeError):
    """Raised when no converter can produce a DXF output."""


# ── Helpers ────────────────────────────────────────────────────────────────────


def _check_output(out_dir: Path, stem: str) -> Path | None:
    """Return the produced DXF path if it exists, else None."""
    candidate = out_dir / f"{stem}.dxf"
    if candidate.exists() and candidate.stat().st_size > 0:
        return candidate
    # ODA may capitalise the extension
    for path in out_dir.iterdir():
        if path.suffix.lower() == ".dxf" and path.stat().st_size > 0:
            return path
    return None


# ── Converter strategies ────────────────────────────────────────────────────────


def _try_oda(dwg_path: Path, out_dir: Path, oda_exe: str) -> Path | None:
    """
    Run ODA File Converter.

    CLI: ODAFileConverter <in_dir> <out_dir> ACAD2018 DXF 0 1 <filename>
    """
    if not os.path.isfile(oda_exe):
        logger.warning("ODA binary not found at %s", oda_exe)
        return None

    cmd = [
        # "/usr/bin/xvfb-run", "-a",
        oda_exe,
        str(dwg_path.parent),
        str(out_dir),
        "ACAD2018",
        "DXF",
        "0",
        "1",
        dwg_path.name,
    ]
    logger.info("ODA command: %s", " ".join(cmd))
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
        )
        logger.debug("ODA stdout: %s", result.stdout)
        logger.debug("ODA stderr: %s", result.stderr)
    except (subprocess.TimeoutExpired, OSError) as exc:
        logger.error("ODA execution error: %s", exc)
        return None

    return _check_output(out_dir, dwg_path.stem)


def _try_libredwg(dwg_path: Path, out_dir: Path, libre_path: str) -> Path | None:
    """Run dwg2dxf from LibreDWG."""
    exe = libre_path or shutil.which("dwg2dxf") or shutil.which("libredwg")
    if not exe or not os.path.isfile(exe):
        logger.warning("LibreDWG binary not found")
        return None

    out_file = out_dir / f"{dwg_path.stem}.dxf"
    cmd = [exe, str(dwg_path), "-o", str(out_file)]
    logger.info("LibreDWG command: %s", " ".join(cmd))
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
        )
        logger.debug("LibreDWG stdout: %s", result.stdout)
        logger.debug("LibreDWG stderr: %s", result.stderr)
    except (subprocess.TimeoutExpired, OSError) as exc:
        logger.error("LibreDWG execution error: %s", exc)
        return None

    return _check_output(out_dir, dwg_path.stem)


def _try_direct(dwg_path: Path, out_dir: Path) -> Path | None:
    """If the file is already a DXF, copy it to the output directory."""
    if dwg_path.suffix.lower() != ".dxf":
        return None
    dest = out_dir / dwg_path.name
    shutil.copy2(dwg_path, dest)
    logger.info("Source is already a DXF; copied to output dir")
    return dest


# ── Public API ─────────────────────────────────────────────────────────────────


def convert_dwg_to_dxf(
    dwg_path: Path,
    *,
    converter: str = "none",
    oda_path: str | None = None,
    libre_path: str | None = None,
) -> Path:
    """
    Convert *dwg_path* to DXF inside a temporary directory.

    Returns the path to the produced DXF file (caller owns the temp dir via the
    returned path's parent — caller must clean up).

    Raises ConversionError if no strategy succeeds.
    """
    out_dir = Path(tempfile.mkdtemp(prefix="panelx_dxf_"))
    dxf_path: Path | None = None

    if converter == "oda" and oda_path:
        dxf_path = _try_oda(dwg_path, out_dir, oda_path)

    if dxf_path is None and (converter in ("libre", "oda")):
        dxf_path = _try_libredwg(dwg_path, out_dir, libre_path or "")

    if dxf_path is None:
        dxf_path = _try_direct(dwg_path, out_dir)

    if dxf_path is None:
        shutil.rmtree(out_dir, ignore_errors=True)
        raise ConversionError(
            f"All conversion strategies failed for {dwg_path.name}. "
            "Set DWG_CONVERTER=oda and ODA_CONVERTER_PATH in .env."
        )

    logger.info("Conversion succeeded → %s (%.1f KB)", dxf_path, dxf_path.stat().st_size / 1024)
    return dxf_path
