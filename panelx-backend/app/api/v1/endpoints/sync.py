from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_permission
from app.core.database import get_db
from app.models.user import User
from app.schemas.sync import (
    SyncConfigCreate,
    SyncConfigResponse,
    SyncConfigUpdate,
    TestConnectionRequest,
    TestConnectionResponse,
)
from app.services.sync_service import SyncService

router = APIRouter()


@router.post(
    "/config",
    response_model=SyncConfigResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create SFTP sync configuration for a project",
)
async def create_sync_config(
    project_id: UUID,
    data: SyncConfigCreate,
    current_user: User = Depends(require_permission("configure_sync")),
    db: AsyncSession = Depends(get_db),
) -> SyncConfigResponse:
    service = SyncService(db)
    config = await service.create_config(
        project_id=project_id,
        data=data,
        created_by=current_user.id,
    )
    return SyncConfigResponse.model_validate(config)


@router.get(
    "/config/{project_id}",
    response_model=SyncConfigResponse,
    summary="Retrieve SFTP sync configuration for a project",
)
async def get_sync_config(
    project_id: UUID,
    current_user: User = Depends(require_permission("view_sync")),
    db: AsyncSession = Depends(get_db),
) -> SyncConfigResponse:
    service = SyncService(db)
    config = await service.get_config(project_id)
    return SyncConfigResponse.model_validate(config)


@router.put(
    "/config/{project_id}",
    response_model=SyncConfigResponse,
    summary="Update SFTP sync configuration for a project",
)
async def update_sync_config(
    project_id: UUID,
    data: SyncConfigUpdate,
    current_user: User = Depends(require_permission("configure_sync")),
    db: AsyncSession = Depends(get_db),
) -> SyncConfigResponse:
    service = SyncService(db)
    config = await service.update_config(project_id, data)
    return SyncConfigResponse.model_validate(config)


@router.delete(
    "/config/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete SFTP sync configuration for a project",
)
async def delete_sync_config(
    project_id: UUID,
    current_user: User = Depends(require_permission("configure_sync")),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = SyncService(db)
    await service.delete_config(project_id)


@router.post(
    "/test-connection",
    response_model=TestConnectionResponse,
    summary="Test SFTP connection without saving credentials",
)
async def test_connection(
    data: TestConnectionRequest,
    current_user: User = Depends(require_permission("configure_sync")),
    db: AsyncSession = Depends(get_db),
) -> TestConnectionResponse:
    service = SyncService(db)
    result = await service.test_connection(data)
    return TestConnectionResponse(**result)
