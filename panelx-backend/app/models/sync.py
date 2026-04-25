import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class SyncConfig(Base):
    """SFTP synchronisation configuration for a project."""

    __tablename__ = "sync_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    server_address = Column(String(255), nullable=False)
    port = Column(Integer, default=22, nullable=False)
    username = Column(String(255), nullable=False)
    # Password stored as Fernet-encrypted ciphertext – never plaintext
    password_encrypted = Column(String(1000), nullable=False)
    file_path = Column(String(1000), nullable=False)
    # e.g. "manual", "hourly", "daily", "weekly"
    sync_frequency = Column(String(50), default="manual", nullable=False)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
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
    project = relationship("Project", back_populates="sync_config")
