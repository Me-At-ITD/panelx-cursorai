from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None



class ProjectAssignedUserResponse(BaseModel):
    user_id: UUID
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[UUID] = None
    role_name: Optional[str] = None

class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: Optional[UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime
    users: list[ProjectAssignedUserResponse] = []


class ProjectListResponse(BaseModel):
    total: int
    items: list[ProjectResponse]


class ProjectStatsResponse(BaseModel):
    total: int
    active: int
    on_hold: int
    completed: int


# ── User assignment schemas ───────────────────────────────────────────────────

class AssignUserToProjectRequest(BaseModel):
    """Assign a single user to one or more projects."""
    user_id: UUID
    project_ids: List[UUID]
    role_id: Optional[UUID] = None


class UpdateUserProjectsRequest(BaseModel):
    """Replace all project assignments for a user."""
    user_id: UUID
    project_ids: List[UUID]
    role_id: Optional[UUID] = None


class RemoveUserFromProjectRequest(BaseModel):
    user_id: UUID
    project_id: UUID


class ProjectUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    project_id: UUID
    role_id: Optional[UUID] = None
    assigned_at: datetime


class BulkAssignResponse(BaseModel):
    assigned: List[ProjectUserResponse]
    skipped: List[UUID]  # project_ids already assigned
