import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
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
    role_permissions = relationship(
        "RolePermission",
        back_populates="role",
        cascade="all, delete-orphan",
    )
    user_roles = relationship(
        "UserRole",
        back_populates="role",
        cascade="all, delete-orphan",
    )
    project_users = relationship("ProjectUser", back_populates="role")

    # Computed helper – requires role_permissions to be loaded
    @property
    def permissions(self):
        return [rp.permission for rp in (self.role_permissions or []) if rp.permission is not None]


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ──────────────────────────────────────────────────────
    role_permissions = relationship(
        "RolePermission",
        back_populates="permission",
        cascade="all, delete-orphan",
    )


class UserRole(Base):
    """Association: which roles a user holds globally."""

    __tablename__ = "user_roles"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    assigned_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    assigned_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Relationships ──────────────────────────────────────────────────────
    user = relationship("User", back_populates="user_roles", foreign_keys=[user_id])
    role = relationship("Role", back_populates="user_roles")


class RolePermission(Base):
    """Association: which permissions belong to a role."""

    __tablename__ = "role_permissions"

    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    permission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # ── Relationships ──────────────────────────────────────────────────────
    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")
