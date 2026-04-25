from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.password_reset import PasswordResetToken
from app.models.role import UserRole
from app.models.token import RefreshToken
from app.models.user import User
from app.schemas.auth import ForgotPasswordRequest, LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, ResetPasswordRequest
from app.schemas.user import UpdatePasswordRequest, UpdateProfileRequest, UserCreateRequest


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register(self, data: RegisterRequest) -> User:
        result = await self.db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")
        user = User(email=data.email, password_hash=hash_password(data.password), full_name=data.full_name)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def create_user(self, data: UserCreateRequest) -> User:
        """Admin-only path: create a user account (no self-registration)."""
        result = await self.db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")
        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            is_superuser=data.is_superuser,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def login(self, data: LoginRequest) -> dict:
        result = await self.db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if user is None or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
        access_token = create_access_token(subject=str(user.id))
        refresh_token_str, expires_at = create_refresh_token(subject=str(user.id))
        self.db.add(RefreshToken(user_id=user.id, token_hash=hash_token(refresh_token_str), expires_at=expires_at))
        await self.db.commit()
        return {"access_token": access_token, "refresh_token": refresh_token_str, "token_type": "bearer"}

    async def refresh(self, data: RefreshRequest) -> dict:
        invalid_exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
        try:
            payload = decode_refresh_token(data.refresh_token)
        except JWTError:
            raise invalid_exc
        if payload.get("type") != "refresh":
            raise invalid_exc
        user_id_str: str | None = payload.get("sub")
        if not user_id_str:
            raise invalid_exc
        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise invalid_exc
        token_hash = hash_token(data.refresh_token)
        result = await self.db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        db_token = result.scalar_one_or_none()
        if db_token is None or db_token.is_revoked:
            raise invalid_exc
        if db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise invalid_exc
        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if user is None or not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account not found or deactivated")
        db_token.is_revoked = True
        new_access = create_access_token(subject=str(user.id))
        new_refresh_str, new_expires = create_refresh_token(subject=str(user.id))
        self.db.add(RefreshToken(user_id=user.id, token_hash=hash_token(new_refresh_str), expires_at=new_expires))
        await self.db.commit()
        return {"access_token": new_access, "refresh_token": new_refresh_str, "token_type": "bearer"}

    async def logout(self, data: LogoutRequest) -> None:
        token_hash = hash_token(data.refresh_token)
        result = await self.db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        db_token = result.scalar_one_or_none()
        if db_token is not None and not db_token.is_revoked:
            db_token.is_revoked = True
            await self.db.commit()

    async def get_user_by_id(self, user_id: UUID) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def get_user_detail(self, user_id: UUID) -> User:
        result = await self.db.execute(
            select(User).options(selectinload(User.user_roles).selectinload(UserRole.role)).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def list_users(self, skip: int = 0, limit: int = 100) -> tuple[list[User], int]:
        from sqlalchemy import func
        count_result = await self.db.execute(select(func.count()).select_from(User))
        total = count_result.scalar_one()
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.user_roles).selectinload(UserRole.role))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def update_user(self, user_id: UUID, full_name: str | None, email: str | None, is_active: bool | None, is_superuser: bool | None, password: str | None = None) -> User:
        user = await self.get_user_detail(user_id)
        if full_name is not None:
            user.full_name = full_name
        if email is not None and email != user.email:
            existing = await self.db.execute(select(User).where(User.email == email, User.id != user_id))
            if existing.scalar_one_or_none() is not None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
            user.email = email
        if is_active is not None:
            user.is_active = is_active
        if is_superuser is not None:
            user.is_superuser = is_superuser
        if password is not None:
            user.password_hash = hash_password(password)
        await self.db.commit()
        return await self.get_user_detail(user_id)

    async def deactivate_user(self, user_id: UUID) -> User:
        user = await self.get_user_by_id(user_id)
        user.is_active = False
        await self.db.commit()
        await self.db.refresh(user)
        return user

    # ── Profile ───────────────────────────────────────────────────────────

    async def update_profile(
        self,
        user: User,
        data: UpdateProfileRequest,
        profile_image: UploadFile | None = None,
    ) -> User:
        if data.full_name is not None:
            user.full_name = data.full_name

        if data.email is not None and data.email != user.email:
            result = await self.db.execute(select(User).where(User.email == data.email))
            if result.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists",
                )
            user.email = data.email

        if profile_image is not None and profile_image.filename:
            allowed_content_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
            if profile_image.content_type not in allowed_content_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Profile image must be a JPEG, PNG, GIF, or WebP file",
                )
            from app.services.s3_service import S3Service  # local import to avoid circular
            s3 = S3Service()
            info = await s3.upload_file(profile_image, project_id="avatars", prefix="avatars")
            user.profile_image_url = info["storage_url"]

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user: User, data: UpdatePasswordRequest) -> None:
        if not verify_password(data.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )
        user.password_hash = hash_password(data.new_password)
        # Revoke all existing refresh tokens so other sessions are invalidated
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user.id,
                RefreshToken.is_revoked.is_(False),
            )
        )
        for token in result.scalars().all():
            token.is_revoked = True
        await self.db.commit()

    # ── Password reset ────────────────────────────────────────────────────

    async def forgot_password(self, data: ForgotPasswordRequest) -> None:
        """
        Always returns without error even if the email is not found
        (prevents user enumeration). Sends a reset link if the user exists.
        """
        from app.services.email_service import send_password_reset_email  # local import

        result = await self.db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if user is None or not user.is_active:
            return  # silent — do not reveal existence

        # Invalidate any existing unused tokens for this user
        existing = await self.db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at.is_(None),
            )
        )
        for t in existing.scalars().all():
            t.used_at = datetime.now(timezone.utc)  # mark old tokens consumed

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES
        )
        self.db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=token_hash,
                expires_at=expires_at,
            )
        )
        await self.db.commit()

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        await send_password_reset_email(
            to=user.email,
            reset_url=reset_url,
            full_name=user.full_name,
        )

    async def reset_password(self, data: ResetPasswordRequest) -> None:
        token_hash = hashlib.sha256(data.token.encode()).hexdigest()
        result = await self.db.execute(
            select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        )
        db_token = result.scalar_one_or_none()

        invalid_exc = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
        if db_token is None:
            raise invalid_exc
        if db_token.used_at is not None:
            raise invalid_exc
        if db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise invalid_exc

        user_result = await self.db.execute(select(User).where(User.id == db_token.user_id))
        user = user_result.scalar_one_or_none()
        if user is None or not user.is_active:
            raise invalid_exc

        user.password_hash = hash_password(data.new_password)
        db_token.used_at = datetime.now(timezone.utc)

        # Revoke all refresh tokens so all active sessions are invalidated
        rt_result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user.id,
                RefreshToken.is_revoked.is_(False),
            )
        )
        for token in rt_result.scalars().all():
            token.is_revoked = True

        await self.db.commit()
