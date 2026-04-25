from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from cryptography.fernet import Fernet, InvalidToken
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password Hashing ──────────────────────────────────────────────────────────
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return _pwd_context.verify(plain, hashed)


# ── JWT Tokens ────────────────────────────────────────────────────────────────
def create_access_token(
    subject: Any,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT access token.

    Raises:
        jose.JWTError: if the token is invalid or expired.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )


# ── Refresh Tokens ────────────────────────────────────────────────────────────
# Refresh tokens are signed with SECRET_KEY — deliberately separate from
# JWT_SECRET_KEY so the two token types cannot be substituted for each other.

def create_refresh_token(
    subject: Any,
    expires_delta: Optional[timedelta] = None,
) -> tuple[str, datetime]:
    """
    Create a signed JWT refresh token.

    Returns:
        (token_string, expiry_datetime)
    """
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        if expires_delta is not None
        else timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "type": "refresh",
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expire


def decode_refresh_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT refresh token.

    Raises:
        jose.JWTError: if the token is invalid or expired.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )


def hash_token(token: str) -> str:
    """Return a SHA-256 hex digest of a raw token string (safe for DB storage)."""
    return hashlib.sha256(token.encode()).hexdigest()


# ── Symmetric Encryption (SFTP passwords at rest) ────────────────────────────

def _get_fernet() -> Fernet:
    """Return a Fernet instance using the configured ENCRYPTION_KEY."""
    return Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt_value(plaintext: str) -> str:
    """Encrypt a string and return a URL-safe base64 token."""
    return _get_fernet().encrypt(plaintext.encode()).decode()


def decrypt_value(token: str) -> str:
    """
    Decrypt a Fernet token back to plaintext.

    Raises:
        cryptography.fernet.InvalidToken: if the token is invalid or tampered.
    """
    try:
        return _get_fernet().decrypt(token.encode()).decode()
    except InvalidToken as exc:
        raise ValueError("Failed to decrypt value – token is invalid or key mismatch") from exc
