from __future__ import annotations

import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Panel(Base):
    __tablename__ = "panels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    file_id = Column(
        UUID(as_uuid=True),
        ForeignKey("files.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Panel identity fields (extracted from DXF attributes)
    panel_id = Column(String(100), nullable=False, index=True)
    floor = Column(String(100), nullable=True, index=True)
    area = Column(String(255), nullable=True, index=True)        # text zone/area
    work_order = Column(String(100), nullable=True, index=True)
    date = Column(String(20), nullable=True)                     # DD/MM/YYYY

    # DXF geometry
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)

    # DXF entity context
    entity_handle = Column(String(50), nullable=True)
    block_name = Column(String(255), nullable=True, index=True)
    layer = Column(String(255), nullable=True)

    # Raw attributes dict for full auditability
    raw_attributes = Column(JSON, nullable=True, default=dict)

    # Data origin ("dwg" | "manual")
    source = Column(String(20), nullable=False, default="dwg")

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ──────────────────────────────────────────────────────
    file = relationship("File", back_populates="panels")
    project = relationship("Project")

    # ── Composite indexes ──────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_panels_file_panel", "file_id", "panel_id"),
        Index("ix_panels_search", "file_id", "floor", "area", "work_order"),
    )
