"""
Goal Pydantic schemas for Body Recomp Backend.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import (
    BaseModel,
    Field,
    model_validator,
)

from src.models.enums import GoalType, GoalStatus


class GoalCreate(BaseModel):
    """
    Schema for creating a new goal.
    
    For cutting: provide target_body_fat_percentage (< initial).
    For bulking: provide ceiling_body_fat_percentage (> initial).
    """

    goal_type: GoalType = Field(
        ...,
        description="Type of goal: cutting or bulking",
    )
    initial_measurement_id: UUID = Field(
        ...,
        description="ID of the initial body measurement",
    )
    target_body_fat_percentage: Optional[Decimal] = Field(
        None,
        ge=3.0,
        le=50.0,
        description="Target body fat % for cutting goals",
    )
    ceiling_body_fat_percentage: Optional[Decimal] = Field(
        None,
        ge=3.0,
        le=50.0,
        description="Maximum body fat % ceiling for bulking goals",
    )

    @model_validator(mode="after")
    def validate_goal_targets(self) -> "GoalCreate":
        """
        Validate that exactly one target is provided based on goal type.
        
        Implements FR-003 business rules.
        """
        if self.goal_type == GoalType.CUTTING:
            if self.target_body_fat_percentage is None:
                raise ValueError(
                    "target_body_fat_percentage is required for cutting goals"
                )
            if self.ceiling_body_fat_percentage is not None:
                raise ValueError(
                    "ceiling_body_fat_percentage should not be set "
                    "for cutting goals"
                )
        elif self.goal_type == GoalType.BULKING:
            if self.ceiling_body_fat_percentage is None:
                raise ValueError(
                    "ceiling_body_fat_percentage is required for bulking goals"
                )
            if self.target_body_fat_percentage is not None:
                raise ValueError(
                    "target_body_fat_percentage should not be set "
                    "for bulking goals"
                )
        
        return self


class GoalUpdate(BaseModel):
    """Schema for updating an existing goal."""

    status: Optional[GoalStatus] = Field(
        None,
        description="Update goal status",
    )
    target_calories: Optional[int] = Field(
        None,
        ge=1200,
        le=5000,
        description="Update daily calorie target",
    )


class GoalResponse(BaseModel):
    """Schema for returning a goal."""

    id: UUID
    user_id: UUID
    goal_type: GoalType
    status: GoalStatus
    initial_measurement_id: UUID
    initial_body_fat_percentage: float
    initial_weight_kg: float
    target_body_fat_percentage: Optional[float] = None
    ceiling_body_fat_percentage: Optional[float] = None
    target_calories: int
    estimated_weeks_to_goal: Optional[int] = None
    current_body_fat_percentage: float
    progress_percentage: float
    weeks_elapsed: int
    is_on_track: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class GoalWithProgress(GoalResponse):
    """
    Extended goal schema with progress calculations.
    
    Used for detailed goal views showing progress metrics.
    """

    current_body_fat_percentage: Optional[Decimal] = Field(
        None,
        description="Current body fat % from latest progress entry",
    )
    progress_percentage: Optional[Decimal] = Field(
        None,
        description="Progress toward goal as percentage",
    )
    weeks_elapsed: Optional[int] = Field(
        None,
        description="Weeks since goal started",
    )
    is_on_track: Optional[bool] = Field(
        None,
        description="Whether progress is on track with estimate",
    )
