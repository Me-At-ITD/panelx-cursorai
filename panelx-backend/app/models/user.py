import uuid

from sqlalchemy import Boolean, Column, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    profile_image_url = Column(String(1024), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ── Relationships ──────────────────────────────────────────────────────
    user_roles = relationship(
        "UserRole",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="UserRole.user_id",
    )
    project_users = relationship(
        "ProjectUser",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="ProjectUser.user_id",
    )
    owned_projects = relationship(
        "Project",
        back_populates="owner",
        foreign_keys="Project.owner_id",
    )
    uploaded_files = relationship(
        "File",
        back_populates="uploader",
        foreign_keys="File.uploaded_by",
    )
    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    password_reset_tokens = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # Computed helper – requires user_roles to be loaded
    @property
    def roles(self):
        return [ur.role for ur in (self.user_roles or []) if ur.role is not None]
