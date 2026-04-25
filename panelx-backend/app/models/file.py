import uuid

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class File(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=True)
    content_type = Column(String(255), nullable=True)
    storage_key = Column(String(1000), nullable=False)
    storage_url = Column(Text, nullable=True)
    bucket_name = Column(String(255), nullable=False)
    uploaded_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    # Lifecycle: uploaded → processing → completed | failed
    status = Column(String(50), default="uploaded", nullable=False, index=True)

    # ── Pipeline tracking ──────────────────────────────────────────────────
    progress = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    task_id = Column(String(255), nullable=True)
    panel_count = Column(Integer, nullable=True)
    dxf_storage_key = Column(String(1000), nullable=True)   # MinIO key of converted DXF
    processed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ──────────────────────────────────────────────────────
    project = relationship("Project", back_populates="files")
    uploader = relationship(
        "User", back_populates="uploaded_files", foreign_keys=[uploaded_by]
    )
    panels = relationship(
        "Panel",
        back_populates="file",
        cascade="all, delete-orphan",
        lazy="select",
    )
