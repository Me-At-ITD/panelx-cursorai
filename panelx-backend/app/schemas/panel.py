from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class PanelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    file_id: UUID
    project_id: UUID
    panel_id: str
    floor: Optional[str] = None
    area: Optional[str] = None
    work_order: Optional[str] = None
    date: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    entity_handle: Optional[str] = None
    block_name: Optional[str] = None
    layer: Optional[str] = None
    raw_attributes: Optional[Dict[str, Any]] = None
    source: str
    created_at: datetime


class PanelDetailResponse(PanelResponse):
    """Extends PanelResponse with contextual file info."""
    file_name: Optional[str] = None


class PanelListResponse(BaseModel):
    total: int
    page: int
    per_page: int
    items: List[PanelResponse]


class PanelUpdateRequest(BaseModel):
    floor: Optional[str] = None
    area: Optional[str] = None
    work_order: Optional[str] = None
    date: Optional[str] = None

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        import re
        if not re.match(r"^\d{2}/\d{2}/\d{4}$", v):
            raise ValueError("date must be in DD/MM/YYYY format")
        return v


class PanelSearchParams(BaseModel):
    """Query parameters for panel search — not a DB model."""
    panel_id: Optional[str] = None       # ilike partial match
    floor: Optional[str] = None          # exact
    area: Optional[str] = None           # exact
    work_order: Optional[str] = None     # exact
    date_from: Optional[str] = None      # DD/MM/YYYY inclusive
    date_to: Optional[str] = None        # DD/MM/YYYY inclusive
    page: int = 1
    per_page: int = 50
