"""
Panels REST API.

Routes
------
GET    /{project_id}/{file_id}
           List panels for a file with optional search filters and pagination.
           Redis-cached for 30 s per unique filter combination.

GET    /{project_id}/{file_id}/{panel_db_id}
           Get a single panel by its DB primary key UUID.

PUT    /{project_id}/{file_id}/{panel_db_id}
           Update editable panel fields (floor, area, work_order, date).

GET    /{project_id}/{file_id}/lookup/{panel_id_str}
           Lookup panels by their DXF panel_id value (can return multiple hits).
"""
from __future__ import annotations

import hashlib
import json
import logging
from typing import List, Optional
from uuid import UUID

import redis as redis_lib
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_permission, require_project_access
from app.core.config import settings
from app.core.database import get_db
from app.models.panel import Panel
from app.models.user import User
from app.schemas.panel import (
    PanelDetailResponse,
    PanelListResponse,
    PanelResponse,
    PanelUpdateRequest,
)

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Redis cache ────────────────────────────────────────────────────────────────

_redis_client: Optional[redis_lib.Redis] = None


def _redis() -> Optional[redis_lib.Redis]:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis_lib.from_url(settings.REDIS_URL, decode_responses=True)
            _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client


_CACHE_TTL = 30  # seconds


def _cache_key(project_id: UUID, file_id: UUID, **kwargs) -> str:
    payload = json.dumps(
        {"project_id": str(project_id), "file_id": str(file_id), **{k: str(v) for k, v in kwargs.items() if v is not None}},
        sort_keys=True,
    )
    return "panels:" + hashlib.sha256(payload.encode()).hexdigest()


# ── List / search ──────────────────────────────────────────────────────────────


@router.get(
    "/{project_id}/{file_id}",
    response_model=PanelListResponse,
    summary="List panels for a file (with optional search filters)",
)
async def list_panels(
    project_id: UUID,
    file_id: UUID,
    panel_id: Optional[str] = Query(None, description="Partial panel_id match (case-insensitive)"),
    floor: Optional[str] = Query(None, description="Exact floor match"),
    area: Optional[str] = Query(None, description="Exact area/zone match"),
    work_order: Optional[str] = Query(None, description="Exact work_order match"),
    date_from: Optional[str] = Query(None, description="Date range start DD/MM/YYYY"),
    date_to: Optional[str] = Query(None, description="Date range end DD/MM/YYYY"),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=500),
    current_user: User = Depends(require_permission("read_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> PanelListResponse:
    cache_key = _cache_key(
        project_id, file_id,
        panel_id=panel_id, floor=floor, area=area, work_order=work_order,
        date_from=date_from, date_to=date_to, page=page, per_page=per_page,
    )
    rc = _redis()
    if rc:
        try:
            cached = rc.get(cache_key)
            if cached:
                return PanelListResponse(**json.loads(cached))
        except Exception:
            pass

    # Build query
    filters = [
        Panel.file_id == file_id,
        Panel.project_id == project_id,
    ]
    if panel_id:
        filters.append(Panel.panel_id.ilike(f"%{panel_id}%"))
    if floor:
        filters.append(Panel.floor == floor)
    if area:
        filters.append(Panel.area == area)
    if work_order:
        filters.append(Panel.work_order == work_order)
    if date_from:
        filters.append(Panel.date >= date_from)
    if date_to:
        filters.append(Panel.date <= date_to)

    # Total count
    count_q = await db.execute(select(func.count()).select_from(Panel).where(and_(*filters)))
    total: int = count_q.scalar_one()

    # Page
    offset = (page - 1) * per_page
    rows = await db.execute(
        select(Panel).where(and_(*filters)).offset(offset).limit(per_page).order_by(Panel.panel_id)
    )
    items = [PanelResponse.model_validate(p) for p in rows.scalars().all()]

    result = PanelListResponse(total=total, page=page, per_page=per_page, items=items)

    if rc:
        try:
            rc.setex(cache_key, _CACHE_TTL, result.model_dump_json())
        except Exception:
            pass

    return result


# ── Single panel detail ────────────────────────────────────────────────────────


@router.get(
    "/{project_id}/{file_id}/{panel_db_id}",
    response_model=PanelDetailResponse,
    summary="Get a panel by its DB UUID",
)
async def get_panel(
    project_id: UUID,
    file_id: UUID,
    panel_db_id: UUID,
    current_user: User = Depends(require_permission("read_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> PanelDetailResponse:
    row = await db.execute(
        select(Panel).where(
            and_(
                Panel.id == panel_db_id,
                Panel.file_id == file_id,
                Panel.project_id == project_id,
            )
        )
    )
    panel = row.scalar_one_or_none()
    if panel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Panel not found")

    resp = PanelDetailResponse.model_validate(panel)
    # Attach file name for context
    from app.models.file import File
    file_row = await db.execute(select(File.filename).where(File.id == file_id))
    resp.file_name = file_row.scalar_one_or_none()
    return resp


# ── Panel update ───────────────────────────────────────────────────────────────


@router.put(
    "/{project_id}/{file_id}/{panel_db_id}",
    response_model=PanelResponse,
    summary="Update editable panel fields",
)
async def update_panel(
    project_id: UUID,
    file_id: UUID,
    panel_db_id: UUID,
    body: PanelUpdateRequest,
    current_user: User = Depends(require_permission("upload_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> PanelResponse:
    row = await db.execute(
        select(Panel).where(
            and_(
                Panel.id == panel_db_id,
                Panel.file_id == file_id,
                Panel.project_id == project_id,
            )
        )
    )
    panel = row.scalar_one_or_none()
    if panel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Panel not found")

    updates = body.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(panel, field, value)

    await db.commit()
    await db.refresh(panel)
    return PanelResponse.model_validate(panel)


# ── Lookup by DXF panel_id string ─────────────────────────────────────────────


@router.get(
    "/{project_id}/{file_id}/lookup/{panel_id_str}",
    response_model=List[PanelResponse],
    summary="Find panels by their DXF panel_id value (partial match)",
)
async def lookup_panel(
    project_id: UUID,
    file_id: UUID,
    panel_id_str: str,
    current_user: User = Depends(require_permission("read_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> List[PanelResponse]:
    rows = await db.execute(
        select(Panel).where(
            and_(
                Panel.file_id == file_id,
                Panel.project_id == project_id,
                Panel.panel_id.ilike(f"%{panel_id_str}%"),
            )
        ).limit(100)
    )
    return [PanelResponse.model_validate(p) for p in rows.scalars().all()]
