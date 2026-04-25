from __future__ import annotations

import asyncio
import socket
from concurrent.futures import ThreadPoolExecutor
from uuid import UUID

import paramiko
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_value, encrypt_value
from app.models.sync import SyncConfig
from app.schemas.sync import SyncConfigCreate, SyncConfigUpdate, TestConnectionRequest

# Single shared thread-pool for blocking SFTP operations
_sftp_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="sftp")


def _test_sftp_connection_sync(
    host: str,
    port: int,
    username: str,
    password: str,
    file_path: str,
) -> dict:
    """
    Blocking SFTP connectivity check – run in a thread pool.
    Returns a plain dict so it is safe to return across thread boundaries.
    """
    client = paramiko.SSHClient()
    # WarningPolicy logs unknown keys but allows the connection for test purposes.
    # TODO Milestone 2: store & verify host keys per sync-config (prevent MITM).
    client.set_missing_host_key_policy(paramiko.WarningPolicy())
    try:
        client.connect(
            hostname=host,
            port=port,
            username=username,
            password=password,
            timeout=10,
            banner_timeout=10,
            auth_timeout=10,
            look_for_keys=False,
            allow_agent=False,
        )
        sftp = client.open_sftp()
        try:
            sftp.stat(file_path)
        except FileNotFoundError:
            return {
                "success": False,
                "message": f"Connected successfully but path '{file_path}' was not found",
            }
        finally:
            sftp.close()
        return {"success": True, "message": "SFTP connection and path verification successful"}

    except paramiko.AuthenticationException:
        return {"success": False, "message": "Authentication failed: invalid credentials"}
    except paramiko.SSHException as exc:
        return {"success": False, "message": f"SSH error: {exc}"}
    except (socket.timeout, TimeoutError):
        return {"success": False, "message": "Connection timed out"}
    except OSError as exc:
        return {"success": False, "message": f"Network error: {exc}"}
    finally:
        client.close()


class SyncService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── Config CRUD ───────────────────────────────────────────────────────
    async def create_config(
        self, project_id: UUID, data: SyncConfigCreate, created_by: UUID
    ) -> SyncConfig:
        # One config per project only
        existing = await self.db.execute(
            select(SyncConfig).where(SyncConfig.project_id == project_id)
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A sync configuration already exists for this project. Use PUT to update it.",
            )

        config = SyncConfig(
            project_id=project_id,
            server_address=data.server_address,
            port=data.port,
            username=data.username,
            password_encrypted=encrypt_value(data.password),
            file_path=data.file_path,
            sync_frequency=data.sync_frequency,
        )
        self.db.add(config)
        await self.db.commit()
        await self.db.refresh(config)
        return config

    async def get_config(self, project_id: UUID) -> SyncConfig:
        result = await self.db.execute(
            select(SyncConfig).where(SyncConfig.project_id == project_id)
        )
        config = result.scalar_one_or_none()
        if config is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No sync configuration found for this project",
            )
        return config

    async def update_config(
        self, project_id: UUID, data: SyncConfigUpdate
    ) -> SyncConfig:
        config = await self.get_config(project_id)

        if data.server_address is not None:
            config.server_address = data.server_address
        if data.port is not None:
            config.port = data.port
        if data.username is not None:
            config.username = data.username
        if data.password is not None:
            config.password_encrypted = encrypt_value(data.password)
        if data.file_path is not None:
            config.file_path = data.file_path
        if data.sync_frequency is not None:
            config.sync_frequency = data.sync_frequency
        if data.is_active is not None:
            config.is_active = data.is_active

        await self.db.commit()
        await self.db.refresh(config)
        return config

    async def delete_config(self, project_id: UUID) -> None:
        config = await self.get_config(project_id)
        await self.db.delete(config)
        await self.db.commit()

    # ── Connection test ───────────────────────────────────────────────────
    async def test_connection(self, data: TestConnectionRequest) -> dict:
        """
        Run a non-blocking SFTP connection test by offloading the blocking
        call to a thread-pool executor.
        """
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            _sftp_executor,
            _test_sftp_connection_sync,
            data.server_address,
            data.port,
            data.username,
            data.password,
            data.file_path,
        )
        return result
