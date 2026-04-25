from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.role import AssignRoleRequest, RemoveRoleRequest, UpdateUserRoleRequest
from app.schemas.user import (
    AdminUpdateUserRequest,
    UpdatePasswordRequest,
    UpdateProfileRequest,
    UserCreateRequest,
    UserDetailResponse,
    UserListResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.services.role_service import RoleService

router = APIRouter()


@router.post(
    "",
    response_model=UserDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user and optionally assign a role (admin only)",
    dependencies=[Depends(require_admin)],
)
async def create_user(
    data: UserCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserDetailResponse:
    auth_service = AuthService(db)
    user = await auth_service.create_user(data)
    if data.role_id is not None:
        role_service = RoleService(db)
        await role_service.assign_role_to_user(
            user_id=user.id,
            role_id=data.role_id,
            assigned_by_id=current_user.id,
        )
    user = await auth_service.get_user_detail(user.id)
    return UserDetailResponse.model_validate(user)


@router.get(
    "/me",
    response_model=UserDetailResponse,
    summary="Return the authenticated user's profile with roles",
)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserDetailResponse:
    service = AuthService(db)
    user = await service.get_user_detail(current_user.id)
    return UserDetailResponse.model_validate(user)


@router.put(
    "/me",
    response_model=UserDetailResponse,
    summary="Update own profile (full_name, email and/or profile image)",
)
async def update_me(
    full_name: str | None = Form(default=None),
    email: str | None = Form(default=None),
    profile_image: Annotated[UploadFile, File(description="Profile image (JPEG, PNG, GIF, WebP)")] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserDetailResponse:
    service = AuthService(db)
    data = UpdateProfileRequest(full_name=full_name, email=email)
    user = await service.update_profile(current_user, data, profile_image=profile_image)
    user = await service.get_user_detail(user.id)
    return UserDetailResponse.model_validate(user)


@router.put(
    "/me/password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Change own password (current password required)",
)
async def update_password(
    data: UpdatePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = AuthService(db)
    await service.update_password(current_user, data)


@router.get(
    "",
    response_model=UserListResponse,
    summary="List all users (admin only)",
    dependencies=[Depends(require_admin)],
)
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> UserListResponse:
    service = AuthService(db)
    users, total = await service.list_users(skip=skip, limit=limit)
    return UserListResponse(
        total=total,
        items=[UserDetailResponse.model_validate(u) for u in users],
    )


@router.put(
    "/{user_id}",
    response_model=UserDetailResponse,
    summary="Update any user's profile (admin only)",
    dependencies=[Depends(require_admin)],
)
async def admin_update_user(
    user_id: UUID,
    data: AdminUpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserDetailResponse:
    service = AuthService(db)
    user = await service.update_user(
        user_id=user_id,
        full_name=data.full_name,
        email=data.email,
        is_active=data.is_active,
        is_superuser=data.is_superuser,
        password=data.password,
    )
    if data.role_id is not None:
        role_service = RoleService(db)
        await role_service.set_user_role(
            user_id=user_id,
            role_id=data.role_id,
            assigned_by_id=current_user.id,
        )
    user = await service.get_user_detail(user_id)
    return UserDetailResponse.model_validate(user)


@router.post(
    "/assign-role",
    response_model=UserResponse,
    summary="Assign a global role to a user (admin only)",
    dependencies=[Depends(require_admin)],
)
async def assign_role(
    data: AssignRoleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    role_service = RoleService(db)
    await role_service.assign_role_to_user(
        user_id=data.user_id,
        role_id=data.role_id,
        assigned_by_id=current_user.id,
    )
    auth_service = AuthService(db)
    user = await auth_service.get_user_by_id(data.user_id)
    return UserResponse.model_validate(user)


@router.put(
    "/{user_id}/role",
    response_model=UserDetailResponse,
    summary="Update a user's global role (replaces existing role)",
    dependencies=[Depends(require_admin)],
)
async def update_user_role(
    user_id: UUID,
    data: UpdateUserRoleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserDetailResponse:
    """Replace the user's current role with a new one (one role per user)."""
    role_service = RoleService(db)
    await role_service.set_user_role(
        user_id=user_id,
        role_id=data.role_id,
        assigned_by_id=current_user.id,
    )
    auth_service = AuthService(db)
    user = await auth_service.get_user_detail(user_id)
    return UserDetailResponse.model_validate(user)


@router.delete(
    "/remove-role",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a global role from a user (admin only)",
    dependencies=[Depends(require_admin)],
)
async def remove_role(
    data: RemoveRoleRequest,
    db: AsyncSession = Depends(get_db),
) -> None:
    role_service = RoleService(db)
    await role_service.remove_role_from_user(
        user_id=data.user_id,
        role_id=data.role_id,
    )
