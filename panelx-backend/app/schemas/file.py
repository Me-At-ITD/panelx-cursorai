from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    filename: str
    original_filename: str
    file_size: Optional[int] = None
    content_type: Optional[str] = None
    storage_url: Optional[str] = None
    status: str
    uploaded_by: Optional[UUID] = None
    created_at: datetime

    # Pipeline fields (populated after processing)
    progress: int = 0
    error_message: Optional[str] = None
    panel_count: Optional[int] = None
    dxf_storage_key: Optional[str] = None
    processed_at: Optional[datetime] = None


class FileListResponse(BaseModel):
    total: int
    items: List[FileResponse]


class FileStatusResponse(BaseModel):
    """Lightweight polling payload for pipeline status checks."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: str
    progress: int
    error_message: Optional[str] = None
    panel_count: Optional[int] = None
    task_id: Optional[str] = None
    dxf_storage_key: Optional[str] = None
    processed_at: Optional[datetime] = None

