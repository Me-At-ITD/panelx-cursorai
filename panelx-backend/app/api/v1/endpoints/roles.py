from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.database import get_db
from app.schemas.role import (
    AssignPermissionRequest,
    PermissionResponse,
    RoleCreate,
    RoleDetailResponse,
    RoleUpdate,
)
from app.services.role_service import RoleService

router = APIRouter()


@router.post(
    "",
    response_model=RoleDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new role (admin only)",
    dependencies=[Depends(require_admin)],
)
async def create_role(
    data: RoleCreate,
    db: AsyncSession = Depends(get_db),
) -> RoleDetailResponse:
    service = RoleService(db)
    role = await service.create_role(data)
    return RoleDetailResponse.model_validate(role)


@router.get(
    "",
    response_model=List[RoleDetailResponse],
    summary="List all roles with their permissions",
)
async def list_roles(
    db: AsyncSession = Depends(get_db),
) -> List[RoleDetailResponse]:
    service = RoleService(db)
    roles = await service.list_roles()
    return [RoleDetailResponse.model_validate(r) for r in roles]


@router.get(
    "/permissions",
    response_model=List[PermissionResponse],
    summary="List all available permissions",
)
async def list_permissions(
    db: AsyncSession = Depends(get_db),
) -> List[PermissionResponse]:
    service = RoleService(db)
    perms = await service.list_permissions()
    return [PermissionResponse.model_validate(p) for p in perms]


@router.get(
    "/{role_id}",
    response_model=RoleDetailResponse,
    summary="Get a role with its permissions",
)
async def get_role(
    role_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> RoleDetailResponse:
    service = RoleService(db)
    role = await service.get_role(role_id)
    return RoleDetailResponse.model_validate(role)


@router.put(
    "/{role_id}",
    response_model=RoleDetailResponse,
    summary="Update a role's name or description (admin only)",
    dependencies=[Depends(require_admin)],
)
async def update_role(
    role_id: UUID,
    data: RoleUpdate,
    db: AsyncSession = Depends(get_db),
) -> RoleDetailResponse:
    service = RoleService(db)
    role = await service.update_role(role_id, data)
    return RoleDetailResponse.model_validate(role)


@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a role (admin only)",
    dependencies=[Depends(require_admin)],
)
async def delete_role(
    role_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    service = RoleService(db)
    await service.delete_role(role_id)


@router.put(
    "/{role_id}/permissions",
    response_model=RoleDetailResponse,
    summary="Replace a role's full permission set (admin only)",
    dependencies=[Depends(require_admin)],
)
async def set_role_permissions(
    role_id: UUID,
    data: AssignPermissionRequest,
    db: AsyncSession = Depends(get_db),
) -> RoleDetailResponse:
    service = RoleService(db)
    role = await service.set_role_permissions(role_id, data)
    return RoleDetailResponse.model_validate(role)
