"""
DWG processing pipeline — Celery task.

Pipeline stages and progress milestones
----------------------------------------
  5 %  → task received, file marked "processing"
 15 %  → DWG downloaded from MinIO to local temp dir
 35 %  → DXF converted (ODA / LibreDWG / passthrough)
 45 %  → DXF uploaded to MinIO
 55 %  → DXF parsed; panel extraction started
 85 %  → panels written to DB
100 %  → status = "completed"

Error handling
--------------
* Any unhandled exception marks the file "failed" with the error message and
  re-raises so Celery can retry with exponential back-off (max 3 retries).
* DB updates inside the task use a *synchronous* SQLAlchemy engine derived from
  the async DATABASE_URL (asyncpg → psycopg2), because Celery tasks are sync.
* Each pipeline stage has its own try/except so partial progress is persisted.
"""
from __future__ import annotations

import logging
import os
import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import boto3
from botocore.client import Config
from celery import Task
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.models.file import File  # noqa: F401  (needed for mapper)
from app.models.panel import Panel  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.services.dwg_converter import ConversionError, convert_dwg_to_dxf
from app.services.panel_extractor import extract_panels_from_dxf
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

# ── Sync DB engine for Celery (psycopg2) ──────────────────────────────────────
_SYNC_URL = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
_sync_engine = create_engine(_SYNC_URL, pool_pre_ping=True, future=True)
SyncSession = sessionmaker(bind=_sync_engine, expire_on_commit=False)

# ── MinIO sync client ──────────────────────────────────────────────────────────


def _s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        region_name=settings.AWS_REGION,
        config=Config(signature_version="s3v4"),
    )


# ── DB helpers ─────────────────────────────────────────────────────────────────


def _update_file(
    session: Session,
    file_id: str,
    **kwargs: Any,
) -> None:
    session.execute(
        text(
            "UPDATE files SET "
            + ", ".join(f"{k} = :{k}" for k in kwargs)
            + " WHERE id = CAST(:file_id AS UUID)"
        ),
        {**kwargs, "file_id": str(file_id)},
    )
    session.commit()


def _mark_failed(session: Session, file_id: str, message: str) -> None:
    _update_file(session, file_id, status="failed", error_message=message[:2000])


# ── Celery task ────────────────────────────────────────────────────────────────


class _PipelineTask(Task):
    abstract = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error("process_dwg[%s] failed: %s", task_id, exc, exc_info=einfo)

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logger.warning("process_dwg[%s] retrying: %s", task_id, exc)


@celery_app.task(
    bind=True,
    base=_PipelineTask,
    name="panelx.process_dwg",
    max_retries=3,
    default_retry_delay=60,        # seconds; doubled each retry by Celery
    acks_late=True,
    reject_on_worker_lost=True,
)
def process_dwg(self, file_id: str, project_id: str) -> Dict[str, Any]:
    """
    Full DWG processing pipeline.

    Parameters
    ----------
    file_id    : UUID string of the File record in the DB.
    project_id : UUID string of the owning Project (for MinIO key namespacing).
    """
    tmp_dir: Optional[str] = None
    dxf_tmp_dir: Optional[str] = None

    session: Session = SyncSession()
    try:
        # ── Stage 1: mark processing ─────────────────────────────────────
        _update_file(
            session,
            file_id,
            status="processing",
            progress=5,
            task_id=self.request.id,
            error_message=None,
        )
        logger.info("process_dwg started — file_id=%s", file_id)

        # Fetch the file record
        row = session.execute(
            text("SELECT storage_key, filename FROM files WHERE id = CAST(:id AS UUID)"),
            {"id": str(file_id)},
        ).fetchone()
        if row is None:
            raise RuntimeError(f"File record {file_id} not found")

        storage_key: str = row.storage_key
        filename: str = row.filename

        # ── Stage 2: download DWG from MinIO ─────────────────────────────
        tmp_dir = tempfile.mkdtemp(prefix="panelx_dwg_")
        dwg_path = Path(tmp_dir) / filename

        s3 = _s3_client()
        logger.info("Downloading s3://%s/%s", settings.MINIO_BUCKET_NAME, storage_key)
        s3.download_file(settings.MINIO_BUCKET_NAME, storage_key, str(dwg_path))
        _update_file(session, file_id, progress=15)

        # ── Stage 3: convert DWG → DXF ───────────────────────────────────
        block_patterns = [
            p.strip()
            for p in settings.PANEL_BLOCK_PATTERNS.split(",")
            if p.strip()
        ]

        try:
            dxf_path = convert_dwg_to_dxf(
                dwg_path,
                converter=settings.DWG_CONVERTER,
                oda_path=settings.ODA_CONVERTER_PATH,
                libre_path=settings.LIBRE_DWG_PATH,
            )
            dxf_tmp_dir = str(dxf_path.parent)
        except ConversionError as exc:
            raise RuntimeError(str(exc)) from exc

        _update_file(session, file_id, progress=35)

        # ── Stage 4: upload DXF to MinIO ─────────────────────────────────
        dxf_key = f"dxf/{project_id}/{file_id}.dxf"
        logger.info("Uploading DXF → s3://%s/%s", settings.MINIO_BUCKET_NAME, dxf_key)
        s3.upload_file(
            str(dxf_path),
            settings.MINIO_BUCKET_NAME,
            dxf_key,
            ExtraArgs={"ContentType": "application/dxf"},
        )
        _update_file(session, file_id, dxf_storage_key=dxf_key, progress=45)

        # ── Stage 5: extract panels from DXF ─────────────────────────────
        panels_data, warnings, errors = extract_panels_from_dxf(dxf_path, block_patterns)
        if errors:
            logger.warning("Extraction errors for file %s: %s", file_id, errors)
        for w in warnings:
            logger.debug("Extraction warning: %s", w)

        # ── Stage 5b: log unique tags for operator inspection ──────────────
        all_tags: set = set()
        for p in panels_data:
            if p.get("raw_attributes"):
                all_tags.update(p["raw_attributes"].keys())
        if all_tags:
            logger.info("[DIAG] Unique ATTRIB tags in file %s: %s", file_id, sorted(all_tags))

        _update_file(session, file_id, progress=55)

        # ── Stage 6: persist panels ───────────────────────────────────────
        # Delete stale panels first (idempotent re-processing)
        session.execute(
            text("DELETE FROM panels WHERE file_id = CAST(:file_id AS UUID)"),
            {"file_id": str(file_id)},
        )
        session.commit()

        pid = uuid.UUID(project_id)
        fid = uuid.UUID(file_id)
        panel_objects = [
            Panel(
                file_id=fid,
                project_id=pid,
                **p,
            )
            for p in panels_data
        ]

        # Bulk insert in chunks of 500
        CHUNK = 500
        for i in range(0, len(panel_objects), CHUNK):
            session.bulk_save_objects(panel_objects[i : i + CHUNK])
            session.commit()

        _update_file(session, file_id, progress=85)

        # ── Stage 7: mark completed ───────────────────────────────────────
        _update_file(
            session,
            file_id,
            status="completed",
            progress=100,
            panel_count=len(panels_data),
            processed_at=datetime.now(timezone.utc).isoformat(),
        )

        logger.info(
            "process_dwg completed — file_id=%s panels=%d warnings=%d",
            file_id,
            len(panels_data),
            len(warnings),
        )
        return {
            "file_id": file_id,
            "panel_count": len(panels_data),
            "warnings": warnings[:20],   # cap to avoid huge result payloads
        }

    except Exception as exc:
        logger.exception("process_dwg error for file_id=%s", file_id)
        try:
            _mark_failed(session, file_id, str(exc))
        except Exception:
            pass
        # Exponential back-off: countdown doubles each retry (60 → 120 → 240 s)
        countdown = 60 * (2 ** self.request.retries)
        raise self.retry(exc=exc, countdown=countdown)

    finally:
        session.close()
        if tmp_dir and os.path.isdir(tmp_dir):
            shutil.rmtree(tmp_dir, ignore_errors=True)
        if dxf_tmp_dir and os.path.isdir(dxf_tmp_dir):
            shutil.rmtree(dxf_tmp_dir, ignore_errors=True)
