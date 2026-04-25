from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class SyncConfigCreate(BaseModel):
    server_address: str
    port: int = 22
    username: str
    password: str
    file_path: str
    sync_frequency: str = "manual"

    @field_validator("port")
    @classmethod
    def validate_port(cls, v: int) -> int:
        if not (1 <= v <= 65535):
            raise ValueError("Port must be between 1 and 65535")
        return v

    @field_validator("sync_frequency")
    @classmethod
    def validate_frequency(cls, v: str) -> str:
        allowed = {"manual", "hourly", "daily", "weekly"}
        if v not in allowed:
            raise ValueError(f"sync_frequency must be one of: {', '.join(sorted(allowed))}")
        return v


class SyncConfigUpdate(BaseModel):
    server_address: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    file_path: Optional[str] = None
    sync_frequency: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("port")
    @classmethod
    def validate_port(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 65535):
            raise ValueError("Port must be between 1 and 65535")
        return v


class SyncConfigResponse(BaseModel):
    """Password is never returned in any response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    server_address: str
    port: int
    username: str
    file_path: str
    sync_frequency: str
    last_sync_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TestConnectionRequest(BaseModel):
    server_address: str
    port: int = 22
    username: str
    password: str
    file_path: str = "/"

    @field_validator("port")
    @classmethod
    def validate_port(cls, v: int) -> int:
        if not (1 <= v <= 65535):
            raise ValueError("Port must be between 1 and 65535")
        return v


class TestConnectionResponse(BaseModel):
    success: bool
    message: str
