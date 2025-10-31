"""
Enum definitions for domain types in Body Recomp Backend.
Uses Python string enums for PostgreSQL compatibility.
"""
from enum import Enum


class Gender(str, Enum):
    """User gender for body fat calculations."""
    MALE = "male"
    FEMALE = "female"


class CalculationMethod(str, Enum):
    """Body fat calculation method."""
    NAVY = "navy"
    THREE_SITE = "3_site"
    SEVEN_SITE = "7_site"


class ActivityLevel(str, Enum):
    """User activity level for TDEE calculations."""
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTREMELY_ACTIVE = "extremely_active"


class GoalType(str, Enum):
    """Type of body recomposition goal."""
    CUTTING = "cutting"
    BULKING = "bulking"


class GoalStatus(str, Enum):
    """Status of a goal."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
