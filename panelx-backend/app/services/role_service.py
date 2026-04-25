from __future__ import annotations

from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.role import Permission, Role, RolePermission, UserRole
from app.models.user import User
from app.schemas.role import AssignPermissionRequest, RoleCreate, RoleUpdate


class RoleService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── Roles ─────────────────────────────────────────────────────────────
    async def create_role(self, data: RoleCreate) -> Role:
        result = await self.db.execute(
            select(Role).where(Role.name == data.name)
        )
        if result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Role '{data.name}' already exists",
            )
        role = Role(name=data.name, description=data.description)
        self.db.add(role)
        await self.db.commit()
        await self.db.refresh(role)
        # Re-fetch with relationships loaded (refresh() doesn't eager-load)
        return await self.get_role(role.id)

    async def get_role(self, role_id: UUID) -> Role:
        result = await self.db.execute(
            select(Role)
            .options(
                selectinload(Role.role_permissions).selectinload(RolePermission.permission)
            )
            .where(Role.id == role_id)
        )
        role = result.scalar_one_or_none()
        if role is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )
        return role

    async def list_roles(self) -> List[Role]:
        result = await self.db.execute(
            select(Role).options(
                selectinload(Role.role_permissions).selectinload(RolePermission.permission)
            )
        )
        return list(result.scalars().all())

    async def update_role(self, role_id: UUID, data: RoleUpdate) -> Role:
        role = await self.get_role(role_id)

        if data.name is not None:
            # Check for name collision with another role
            existing = await self.db.execute(
                select(Role).where(Role.name == data.name, Role.id != role_id)
            )
            if existing.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Role name '{data.name}' is already taken",
                )
            role.name = data.name

        if data.description is not None:
            role.description = data.description

        await self.db.commit()
        # Re-fetch with relationships loaded (refresh() doesn't eager-load)
        return await self.get_role(role_id)

    async def delete_role(self, role_id: UUID) -> None:
        role = await self.get_role(role_id)
        await self.db.delete(role)
        await self.db.commit()

    # ── Permissions ───────────────────────────────────────────────────────
    async def list_permissions(self) -> List[Permission]:
        result = await self.db.execute(select(Permission))
        return list(result.scalars().all())

    async def set_role_permissions(
        self, role_id: UUID, data: AssignPermissionRequest
    ) -> Role:
        """Replace the permission set for a role (full replace semantics)."""
        role = await self.get_role(role_id)

        # Validate that all requested permission IDs exist
        result = await self.db.execute(
            select(Permission).where(Permission.id.in_(data.permission_ids))
        )
        found_permissions = result.scalars().all()
        if len(found_permissions) != len(data.permission_ids):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="One or more permission IDs are invalid",
            )

        # Drop existing role-permission associations
        await self.db.execute(
            delete(RolePermission).where(RolePermission.role_id == role_id)
        )

        # Insert new associations
        for perm in found_permissions:
            self.db.add(RolePermission(role_id=role.id, permission_id=perm.id))

        await self.db.commit()
        return await self.get_role(role_id)

    # ── User role assignment ───────────────────────────────────────────────
    async def assign_role_to_user(
        self, user_id: UUID, role_id: UUID, assigned_by_id: UUID
    ) -> UserRole:
        # Verify user and role exist
        user_result = await self.db.execute(select(User).where(User.id == user_id))
        if user_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        role_result = await self.db.execute(select(Role).where(Role.id == role_id))
        if role_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )

        # Check for existing assignment
        existing = await self.db.execute(
            select(UserRole).where(
                UserRole.user_id == user_id, UserRole.role_id == role_id
            )
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has this role",
            )

        assignment = UserRole(
            user_id=user_id, role_id=role_id, assigned_by=assigned_by_id
        )
        self.db.add(assignment)
        await self.db.commit()
        await self.db.refresh(assignment)
        return assignment

    async def set_user_role(self, user_id: UUID, role_id: UUID, assigned_by_id: UUID) -> None:
        """Replace all roles for a user with a single role."""
        role_result = await self.db.execute(select(Role).where(Role.id == role_id))
        if role_result.scalar_one_or_none() is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        await self.db.execute(delete(UserRole).where(UserRole.user_id == user_id))
        self.db.add(UserRole(user_id=user_id, role_id=role_id, assigned_by=assigned_by_id))
        await self.db.commit()

    async def remove_role_from_user(self, user_id: UUID, role_id: UUID) -> None:
        result = await self.db.execute(
            select(UserRole).where(
                UserRole.user_id == user_id, UserRole.role_id == role_id
            )
        )
        assignment = result.scalar_one_or_none()
        if assignment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User does not have this role",
            )
        await self.db.delete(assignment)
        await self.db.commit()
