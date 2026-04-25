import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    status = Column(String(50), default="active", nullable=False)
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
    owner = relationship(
        "User", back_populates="owned_projects", foreign_keys=[owner_id]
    )
    project_users = relationship(
        "ProjectUser",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    files = relationship(
        "File",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    sync_config = relationship(
        "SyncConfig",
        back_populates="project",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ProjectUser(Base):
    """Association: users assigned to a project with a project-specific role."""

    __tablename__ = "project_users"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="SET NULL"),
        nullable=True,
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
    user = relationship("User", back_populates="project_users", foreign_keys=[user_id])
    project = relationship("Project", back_populates="project_users")
    role = relationship("Role", back_populates="project_users")
