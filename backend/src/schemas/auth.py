"""
Pydantic schemas for authentication.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import date
from decimal import Decimal
from src.models.enums import Gender, CalculationMethod, ActivityLevel


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


class GoogleLoginRequest(BaseModel):
    """Schema for Google Login."""

    credential: str = Field(..., description="Google JWT credential")


class GoogleRegisterRequest(BaseModel):
    """Schema for completing registration after Google SSO."""

    credential: str = Field(..., description="Google JWT credential")
    
    date_of_birth: date
    gender: Gender
    height_cm: Decimal = Field(..., ge=120, le=250)
    preferred_calculation_method: CalculationMethod
    activity_level: ActivityLevel
