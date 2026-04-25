import re
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must contain at least one special character")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must contain at least one special character")
        return value


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None
