from __future__ import annotations

from typing import AsyncGenerator, Callable
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.project import ProjectUser
from app.models.role import Permission, Role, RolePermission, UserRole
from app.models.user import User

_bearer = HTTPBearer(auto_error=True)

# ── Privileged role names that bypass project-membership checks ───────────────
_MANAGER_ROLES = {"Admin", "Project Manager"}


# ── Current authenticated user ────────────────────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validate the JWT Bearer token and return the matching active User.
    Raises HTTP 401/403 on any failure.
    """
    exc_401 = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(credentials.credentials)
        token_type: str | None = payload.get("type")
        # Explicitly reject refresh tokens used as access tokens
        if token_type != "access":
            raise exc_401
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise exc_401
    except JWTError:
        raise exc_401

    try:
        uid = UUID(user_id)
    except ValueError:
        raise exc_401

    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if user is None:
        raise exc_401
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated",
        )
    return user


# ── Admin shortcut ────────────────────────────────────────────────────────────
async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency that allows only superusers through."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


# ── Permission-based RBAC factory ─────────────────────────────────────────────
def require_permission(permission_name: str) -> Callable:
    """
    Factory that returns a FastAPI dependency checking that the calling user
    holds a role with the named permission.  Superusers bypass all checks.

    Usage:
        @router.post("/projects")
        async def create(user = Depends(require_permission("create_project")), ...):
    """

    async def _dependency(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        if current_user.is_superuser:
            return current_user

        stmt = (
            select(Permission)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRole, UserRole.role_id == RolePermission.role_id)
            .where(
                and_(
                    UserRole.user_id == current_user.id,
                    Permission.name == permission_name,
                )
            )
            .limit(1)
        )
        result = await db.execute(stmt)
        if result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have the required permission: {permission_name}",
            )
        return current_user

    return _dependency


# ── Project-level access guard ────────────────────────────────────────────────
async def require_project_access(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency: confirms the calling user may access the given project.

    Pass-through conditions (no DB membership required):
      - is_superuser = True
      - holds a global 'Admin' or 'Project Manager' role

    All other users must have an entry in project_users for this project.
    Use on any endpoint that has a `project_id` path parameter.
    """
    if current_user.is_superuser:
        return current_user

    # Check global manager roles
    role_result = await db.execute(
        select(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(
            UserRole.user_id == current_user.id,
            Role.name.in_(_MANAGER_ROLES),
        )
        .limit(1)
    )
    if role_result.scalar_one_or_none() is not None:
        return current_user

    # Check direct project membership
    membership = await db.execute(
        select(ProjectUser).where(
            ProjectUser.user_id == current_user.id,
            ProjectUser.project_id == project_id,
        )
    )
    if membership.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project",
        )
    return current_user
