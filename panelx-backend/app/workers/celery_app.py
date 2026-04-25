from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "panelx_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks", "app.workers.dwg_pipeline"],
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # Timezone
    timezone="UTC",
    enable_utc=True,
    # Reliability
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,   # one task at a time per worker
    # Result expiry
    result_expires=3600,
    # Beat schedule placeholder – populated in future milestones
    beat_schedule={},
)
