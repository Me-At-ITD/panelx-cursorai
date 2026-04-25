from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class PasswordResetToken(Base):
    """Single-use password reset tokens (stored as SHA-256 hashes)."""

    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # SHA-256 hex of the raw URL-safe token — never store plain text
    token_hash = Column(String(64), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # Set when the token is consumed — enforces single-use
    used_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="password_reset_tokens")
