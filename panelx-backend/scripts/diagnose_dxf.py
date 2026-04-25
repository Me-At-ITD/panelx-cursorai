"""
Diagnostic script — inspect all INSERT/ATTDEF entities in the DXF stored in MinIO.

Usage (from D:\PANELSX with venv active):
    python scripts/diagnose_dxf.py [file_id] [project_id]

Defaults to the known test file if no args given.
Outputs:
  - First N INSERT entities: block_name, layer, handle, all ATTRIB tag=value pairs
  - All unique ATTRIB tags across the whole file (sorted)
  - All ATTDEF entities in model-space with PN_PL_ / PB_ prefix
  - Layer name frequency table (to see if floor/area is encoded in layer)
"""
from __future__ import annotations

import os
import sys
import tempfile
from collections import Counter
from pathlib import Path

# Allow running from repo root without installing the package
sys.path.insert(0, str(Path(__file__).parent.parent))

import boto3
from botocore.client import Config

# ── Config ────────────────────────────────────────────────────────────────────
FILE_ID     = sys.argv[1] if len(sys.argv) > 1 else "e8b9b417-71d7-4dac-a8a7-aba158ac9be3"
PROJECT_ID  = sys.argv[2] if len(sys.argv) > 2 else "5d20ad9b-7030-471c-9032-581066a378c6"
SHOW_FIRST  = int(sys.argv[3]) if len(sys.argv) > 3 else 10  # show first N INSERT entities in full

MINIO_ENDPOINT  = os.getenv("MINIO_ENDPOINT_URL", "http://localhost:9000")
MINIO_ACCESS    = os.getenv("MINIO_ACCESS_KEY",   "minioadmin")
MINIO_SECRET    = os.getenv("MINIO_SECRET_KEY",   "minioadmin")
MINIO_BUCKET    = os.getenv("MINIO_BUCKET_NAME",  "panelx-files")

# ── Download DXF ──────────────────────────────────────────────────────────────
dxf_key = f"dxf/{PROJECT_ID}/{FILE_ID}.dxf"
print(f"\n{'='*70}")
print(f"Downloading: s3://{MINIO_BUCKET}/{dxf_key}")
print(f"{'='*70}\n")

s3 = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS,
    aws_secret_access_key=MINIO_SECRET,
    region_name="us-east-1",
    config=Config(signature_version="s3v4"),
)

tmp = tempfile.mkdtemp(prefix="panelx_diag_")
dxf_local = Path(tmp) / "target.dxf"
s3.download_file(MINIO_BUCKET, dxf_key, str(dxf_local))
print(f"Downloaded to: {dxf_local}  ({dxf_local.stat().st_size/1_048_576:.1f} MB)\n")

# ── Open with ezdxf ───────────────────────────────────────────────────────────
import ezdxf

doc = ezdxf.readfile(str(dxf_local))
msp = doc.modelspace()

# ── Pass 1: INSERT entities ───────────────────────────────────────────────────
all_tags: Counter = Counter()
layer_counter: Counter = Counter()
shown = 0
insert_count = 0
inserts_with_attribs = 0

print("─── Sample INSERT entities ───────────────────────────────────────────")
for entity in msp:
    if entity.dxftype() != "INSERT":
        continue
    insert_count += 1
    block_name = entity.dxf.get("name", "") or ""
    handle     = entity.dxf.handle or ""
    layer      = entity.dxf.get("layer", "") or ""
    layer_counter[layer] += 1

    raw: dict = {}
    try:
        for attrib in entity.attribs:
            try:
                tag   = (attrib.dxf.tag  or "").strip()
                value = (attrib.dxf.text or "").strip()
                if tag:
                    raw[tag] = value
                    all_tags[tag.upper()] += 1
            except Exception as exc:
                raw[f"_ERR_{attrib}"] = str(exc)
    except Exception as exc:
        raw["_NO_ATTRIBS"] = str(exc)

    if raw:
        inserts_with_attribs += 1

    if shown < SHOW_FIRST:
        print(f"\n  INSERT #{insert_count}")
        print(f"    block_name : {block_name!r}")
        print(f"    handle     : {handle!r}")
        print(f"    layer      : {layer!r}")
        if raw:
            for tag, val in raw.items():
                print(f"    ATTRIB  {tag:30s} = {val!r}")
        else:
            print(f"    (no ATTRIBs)")
        shown += 1

print(f"\n  ... ({insert_count} total INSERT entities, {inserts_with_attribs} have ATTRIBs)")

# ── All unique ATTRIB tags ─────────────────────────────────────────────────────
print("\n─── All unique ATTRIB tags (sorted by frequency) ─────────────────────")
if all_tags:
    for tag, count in all_tags.most_common():
        print(f"  {tag:40s}  ({count}x)")
else:
    print("  (none found)")

# ── Layer frequency ────────────────────────────────────────────────────────────
print("\n─── Layer names on INSERT entities (top 30) ──────────────────────────")
for layer, count in layer_counter.most_common(30):
    print(f"  {repr(layer):50s}  {count}x")

# ── Pass 2: ATTDEF in model-space ─────────────────────────────────────────────
print("\n─── ATTDEF entities in model-space ───────────────────────────────────")
attdef_count = 0
for entity in msp:
    if entity.dxftype() != "ATTDEF":
        continue
    attdef_count += 1
    tag      = (getattr(entity.dxf, "tag",  "") or "").strip()
    text_val = (getattr(entity.dxf, "text", "") or "").strip()
    layer    = (entity.dxf.get("layer", "")      or "")
    handle   = entity.dxf.handle or ""
    if attdef_count <= 20:
        print(f"  ATTDEF  tag={tag!r:35s}  text={text_val!r:25s}  layer={layer!r}  handle={handle}")
if attdef_count > 20:
    print(f"  ... ({attdef_count} total ATTDEF entities)")
elif attdef_count == 0:
    print("  (none found)")

# ── TEXT / MTEXT entities (in case floor/area is in free text) ────────────────
print("\n─── Sample TEXT/MTEXT entities (first 10) ────────────────────────────")
text_count = 0
for entity in msp:
    if entity.dxftype() not in ("TEXT", "MTEXT"):
        continue
    text_count += 1
    try:
        content = (entity.dxf.text or "").strip()
        layer   = entity.dxf.get("layer", "") or ""
        if text_count <= 10:
            print(f"  {entity.dxftype():6s}  layer={layer!r:30s}  text={content[:80]!r}")
    except Exception:
        pass
if text_count == 0:
    print("  (none found)")
else:
    print(f"  ... ({text_count} total TEXT/MTEXT entities)")

print(f"\n{'='*70}")
print("Diagnosis complete.")
print(f"{'='*70}\n")
