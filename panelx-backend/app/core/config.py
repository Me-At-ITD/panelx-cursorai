from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "PanelX"
    APP_ENV: str = "development"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # ── Security ─────────────────────────────────────────────────────────────
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Fernet symmetric key for encrypting SFTP passwords at rest
    ENCRYPTION_KEY: str

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str  # postgresql+asyncpg://...

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── MinIO / AWS S3 ────────────────────────────────────────────────────────
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET_NAME: str = "panelx-files"
    MINIO_USE_SSL: bool = False
    AWS_REGION: str = "us-east-1"

    # ── File Upload ───────────────────────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 250

    # ── Celery ────────────────────────────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # ── DWG Converter ─────────────────────────────────────────────────────────
    DWG_CONVERTER: str = "none"          # "oda" | "libre" | "none"
    ODA_CONVERTER_PATH: Optional[str] = None
    LIBRE_DWG_PATH: Optional[str] = None

    # ── Panel extraction ──────────────────────────────────────────────────────
    # Comma-separated substrings matched against INSERT block names (case-insensitive).
    # Empty → accept every INSERT that has at least one ATTRIB (most permissive).
    PANEL_BLOCK_PATTERNS: str = ""

    # ── Admin seed (optional) ─────────────────────────────────────────────────
    ADMIN_EMAIL: Optional[str] = None
    ADMIN_PASSWORD: Optional[str] = None
    ADMIN_FULL_NAME: str = "System Administrator"

    # ── Email / SMTP ──────────────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@panelx.io"
    SMTP_TLS: bool = True          # STARTTLS on port 587

    # ── Frontend URL (used in email links) ───────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Password reset token lifetime ────────────────────────────────────────
    PASSWORD_RESET_EXPIRE_MINUTES: int = 60

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def s3_endpoint_url(self) -> str:
        scheme = "https" if self.MINIO_USE_SSL else "http"
        return f"{scheme}://{self.MINIO_ENDPOINT}"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
