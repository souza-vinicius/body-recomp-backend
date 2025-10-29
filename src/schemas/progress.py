"""Progress tracking Pydantic schemas for Body Recomp Backend."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ProgressEntryCreate(BaseModel):
    """Schema for creating a new progress entry.

    Attributes:
        measurement_id: ID of the measurement to log as progress
        notes: Optional user notes about this week's progress
    """

    measurement_id: UUID = Field(
        ...,
        description="ID of the body measurement to log as progress"
    )
    notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional notes about this week's progress"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "measurement_id": "123e4567-e89b-12d3-a456-426614174000",
                    "notes": "Week 1: Good progress, diet compliance high"
                }
            ]
        }
    }


class ProgressEntryResponse(BaseModel):
    """Schema for progress entry response.

    Attributes:
        id: Progress entry ID
        goal_id: Associated goal ID
        measurement_id: Body measurement ID
        week_number: Week number since goal start
        body_fat_percentage: Body fat % at this checkpoint
        weight_kg: Weight at this checkpoint
        body_fat_change: Change from previous week
        weight_change_kg: Weight change from previous week
        is_on_track: Whether meeting expected progress rate
        notes: User or system notes
        logged_at: When this entry was logged
        ceiling_warning: Warning message when approaching bulking ceiling (bulking only)
        rate_warning: Warning message when gaining too fast (bulking only)
    """

    id: UUID
    goal_id: UUID
    measurement_id: UUID
    week_number: int = Field(..., gt=0)
    body_fat_percentage: float = Field(..., ge=3.0, le=60.0)
    weight_kg: float = Field(..., ge=30.0, le=300.0)
    body_fat_change: float
    weight_change_kg: float
    is_on_track: bool
    notes: Optional[str] = None
    logged_at: datetime
    ceiling_warning: Optional[str] = Field(
        None,
        description="Warning when approaching bulking ceiling (within 1%)"
    )
    rate_warning: Optional[str] = Field(
        None,
        description="Warning when body fat gain rate exceeds 0.5%/week"
    )

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "goal_id": "223e4567-e89b-12d3-a456-426614174000",
                    "measurement_id": "323e4567-e89b-12d3-a456-426614174000",
                    "week_number": 1,
                    "body_fat_percentage": 19.5,
                    "weight_kg": 79.0,
                    "body_fat_change": -0.5,
                    "weight_change_kg": -1.0,
                    "is_on_track": True,
                    "notes": "Week 1: Good progress",
                    "logged_at": "2025-10-27T10:00:00Z"
                }
            ]
        }
    }


class TrendsResponse(BaseModel):
    """Schema for progress trends analysis response.

    Provides aggregated analysis of progress over time with recommendations.

    Attributes:
        goal_id: Goal being analyzed
        progress_percentage: Percentage of goal completed (0-100)
        weeks_elapsed: Number of weeks since goal start
        is_on_track: Whether overall progress meets expectations
        weekly_bf_change_avg: Average weekly body fat % change
        weekly_weight_change_avg: Average weekly weight change (kg)
        trend: Overall trend classification
        adjustment_suggestion: Recommended plan adjustments (if any)
        estimated_weeks_remaining: Estimated weeks to reach goal
    """

    goal_id: UUID
    progress_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage of goal completed"
    )
    weeks_elapsed: int = Field(..., ge=0, description="Weeks since goal start")
    is_on_track: bool = Field(..., description="Meeting expected progress rate")
    weekly_bf_change_avg: float = Field(
        ...,
        description="Average weekly body fat % change"
    )
    weekly_weight_change_avg: float = Field(
        ...,
        description="Average weekly weight change in kg"
    )
    trend: str = Field(
        ...,
        description="Overall trend: 'improving', 'plateau', 'worsening', or 'insufficient_data'"
    )
    adjustment_suggestion: Optional[str] = Field(
        None,
        description="Recommended adjustments to training or diet plan"
    )
    estimated_weeks_remaining: Optional[int] = Field(
        None,
        ge=0,
        description="Estimated weeks to reach goal based on current progress"
    )

    @field_validator("trend")
    @classmethod
    def validate_trend(cls, v: str) -> str:
        """Validate trend classification."""
        valid_trends = {"improving", "plateau", "worsening", "insufficient_data"}
        if v not in valid_trends:
            raise ValueError(
                f"trend must be one of {valid_trends}, got '{v}'"
            )
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "goal_id": "223e4567-e89b-12d3-a456-426614174000",
                    "progress_percentage": 25.0,
                    "weeks_elapsed": 4,
                    "is_on_track": True,
                    "weekly_bf_change_avg": -0.5,
                    "weekly_weight_change_avg": -0.8,
                    "trend": "improving",
                    "adjustment_suggestion": "Maintain current plan - excellent progress!",
                    "estimated_weeks_remaining": 12
                }
            ]
        }
    }
