from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.schemas.role import RoleResponse


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserCreateRequest(UserBase):
    """Admin-only: create a user and optionally assign a role in one call."""
    password: str
    role_id: Optional[UUID] = None
    is_superuser: bool = False


class UpdateProfileRequest(BaseModel):
    """Fields the authenticated user can update on their own profile."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    profile_image_url: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime


class UserDetailResponse(UserResponse):
    """Includes role list – requires user_roles relationship to be loaded."""

    roles: List[RoleResponse] = []


class AdminUpdateUserRequest(BaseModel):
    """Admin-only: update any user's profile fields."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    role_id: Optional[UUID] = None
    password: Optional[str] = None


class UserListResponse(BaseModel):
    total: int
    items: List[UserDetailResponse]
