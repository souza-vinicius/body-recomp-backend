"""
Pydantic schemas for User model.
"""
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from src.models.enums import Gender, CalculationMethod, ActivityLevel


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72, description="Password must be between 8 and 72 characters")
    full_name: str = Field(..., min_length=1, max_length=255)
    date_of_birth: date
    gender: Gender
    height_cm: Decimal = Field(..., ge=120, le=250)
    preferred_calculation_method: CalculationMethod
    activity_level: ActivityLevel

    @field_validator('date_of_birth')
    @classmethod
    def validate_age(cls, v: date) -> date:
        """Validate user is between 13 and 120 years old."""
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 13 or age > 120:
            raise ValueError("Age must be between 13 and 120 years")
        return v


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    full_name: str | None = Field(None, min_length=1, max_length=255)
    date_of_birth: date | None = None
    gender: Gender | None = None
    height_cm: Decimal | None = Field(None, ge=120, le=250)
    preferred_calculation_method: CalculationMethod | None = None
    activity_level: ActivityLevel | None = None

    @field_validator('date_of_birth')
    @classmethod
    def validate_age(cls, v: date | None) -> date | None:
        """Validate user is between 13 and 120 years old."""
        if v is None:
            return v
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 13 or age > 120:
            raise ValueError("Age must be between 13 and 120 years")
        return v


class UserResponse(BaseModel):
    """Schema for user response (excludes password)."""

    id: UUID
    email: EmailStr
    full_name: str
    date_of_birth: date
    gender: Gender
    height_cm: float
    preferred_calculation_method: CalculationMethod
    activity_level: ActivityLevel
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserInDB(UserResponse):
    """Schema for user in database (includes hashed password)."""

    hashed_password: str

    model_config = {"from_attributes": True}
