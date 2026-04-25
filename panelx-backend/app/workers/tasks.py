"""
Celery task definitions.

Milestone 1 ships task stubs so the pipeline skeleton is in place.
Actual DWG parsing and SFTP sync logic will be implemented in later milestones.
"""
from __future__ import annotations

import logging

from celery import Task

from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


class BaseTask(Task):
    """Base task with structured logging."""

    abstract = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(
            "Task %s[%s] failed: %s",
            self.name,
            task_id,
            exc,
            exc_info=einfo,
        )

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logger.warning(
            "Task %s[%s] retrying due to: %s",
            self.name,
            task_id,
            exc,
        )


@celery_app.task(
    bind=True,
    base=BaseTask,
    name="panelx.process_dwg_file",
    max_retries=3,
    default_retry_delay=30,
)
def process_dwg_file(self, file_id: str, project_id: str) -> dict:
    """
    DWG file processing pipeline entry point.

    Stages (Milestone 2+):
      1. Download file from MinIO
      2. Parse DWG with ezdxf / ODA
      3. Extract geometry & metadata
      4. Store results in PostGIS
      5. Broadcast progress via WebSocket
    """
    logger.info(
        "process_dwg_file queued – file_id=%s project_id=%s",
        file_id,
        project_id,
    )
    # TODO: Implement DWG parsing in Milestone 2
    return {
        "status": "queued",
        "file_id": file_id,
        "project_id": project_id,
    }


@celery_app.task(
    bind=True,
    base=BaseTask,
    name="panelx.sync_files_from_sftp",
    max_retries=3,
    default_retry_delay=60,
)
def sync_files_from_sftp(self, project_id: str) -> dict:
    """
    SFTP → MinIO file synchronisation task.

    Stages (Milestone 2+):
      1. Load SyncConfig for project
      2. Connect to SFTP server
      3. Compare remote vs stored file list
      4. Download new / changed files to MinIO
      5. Update File records in DB
      6. Enqueue DWG processing for new DWG files
    """
    logger.info("sync_files_from_sftp queued – project_id=%s", project_id)
    # TODO: Implement SFTP sync in a future milestone
    return {
        "status": "queued",
        "project_id": project_id,
    }
