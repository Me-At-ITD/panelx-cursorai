"""Quick extraction test — run with: python scripts/test_extraction.py"""
import tempfile
import boto3
import logging
import sys
from botocore.client import Config
from pathlib import Path

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s %(message)s")
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.panel_extractor import extract_panels_from_dxf

# Use already-cached DXF from previous diagnostic runs
DXF_CACHE = Path(r"C:\Users\Super\AppData\Local\Temp\panelx_diag_457r72x2\target.dxf")
if DXF_CACHE.exists():
    dxf_local = DXF_CACHE
else:
    s3 = boto3.client(
        "s3",
        endpoint_url="http://localhost:9000",
        aws_access_key_id="minioadmin",
        aws_secret_access_key="minioadmin",
        region_name="us-east-1",
        config=Config(signature_version="s3v4"),
    )
    tmp = tempfile.mkdtemp()
    dxf_local = Path(tmp) / "target.dxf"
    print("Downloading DXF...")
    s3.download_file(
        "panelx-files",
        "dxf/5d20ad9b-7030-471c-9032-581066a378c6/e8b9b417-71d7-4dac-a8a7-aba158ac9be3.dxf",
        str(dxf_local),
    )
print("Running extractor...")
panels, warnings, errors = extract_panels_from_dxf(dxf_local)
print(f"Panels: {len(panels)}  warnings: {len(warnings)}  errors: {len(errors)}")
if errors:
    print("ERRORS:", errors[:3])

attdef = [p for p in panels if p.get("block_name") == "ATTDEF"]
print(f"\nTotal panels: {len(panels)}  ATTDEF panels: {len(attdef)}")
print("First 15 ATTDEF panels:")
for p in attdef[:15]:
    pid   = p.get("panel_id", "") or ""
    fl    = p.get("floor")    or "None"
    area  = p.get("area")     or "None"
    wo    = p.get("work_order") or "None"
    layer = p.get("layer")    or "None"
    print(f"  panel_id={pid!r:12s}  floor={fl!r:5s}  area={area!r:8s}  wo={wo!r:12s}  layer={layer!r}")

floors = sorted({p.get("floor") for p in attdef if p.get("floor")})
areas  = sorted({p.get("area")  for p in attdef if p.get("area")})
print(f"\nUnique floors in ATTDEF panels: {floors}")
print(f"Unique areas  in ATTDEF panels: {areas}")

f_ok = sum(1 for p in attdef if p.get("floor"))
a_ok = sum(1 for p in attdef if p.get("area"))
print(f"Floor filled: {f_ok}/{len(attdef)}  Area filled: {a_ok}/{len(attdef)}")
