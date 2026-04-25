from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Obtain JWT access + refresh tokens",
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    service = AuthService(db)
    token_data = await service.login(data)
    return TokenResponse(**token_data)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a valid refresh token for a new token pair",
)
async def refresh_token(
    data: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    service = AuthService(db)
    token_data = await service.refresh(data)
    return TokenResponse(**token_data)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke refresh token (logout)",
)
async def logout(
    data: LogoutRequest,
    db: AsyncSession = Depends(get_db),
) -> None:
    service = AuthService(db)
    await service.logout(data)


@router.post(
    "/forgot-password",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Request a password reset link (sent to email)",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    service = AuthService(db)
    await service.forgot_password(data)
    # Always return the same response to prevent user enumeration
    return {"detail": "If an account with that email exists, a reset link has been sent."}


@router.post(
    "/reset-password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Set a new password using a reset token",
)
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> None:
    service = AuthService(db)
    await service.reset_password(data)
