"""
Pydantic schemas for authentication.
"""
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Schema for login request."""

    email: EmailStr
    password: str = Field(..., min_length=1)


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""

    refresh_token: str = Field(..., min_length=1)


class Token(BaseModel):
    """Schema for token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Seconds until access token expires


class TokenData(BaseModel):
    """Schema for decoded token data."""

    sub: str  # User ID
    exp: int  # Expiration timestamp
    type: str  # Token type (access or refresh)
