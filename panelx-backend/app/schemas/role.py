from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class RoleResponse(RoleBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class RoleDetailResponse(RoleResponse):
    permissions: List[PermissionResponse] = []


class AssignPermissionRequest(BaseModel):
    """Replace the full permission set for a role."""
    permission_ids: List[UUID]


class AssignRoleRequest(BaseModel):
    user_id: UUID
    role_id: UUID


class RemoveRoleRequest(BaseModel):
    user_id: UUID


class UpdateUserRoleRequest(BaseModel):
    """Update a user's global role (replaces current role)."""
    role_id: UUID
    role_id: UUID
