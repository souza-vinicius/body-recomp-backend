"""Training and Diet Plan Pydantic schemas for Body Recomp Backend."""
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TrainingPlanResponse(BaseModel):
    """Schema for training plan response.

    Attributes:
        id: Training plan ID
        goal_id: Associated goal ID
        workout_frequency: Sessions per week
        primary_focus: Main training emphasis
        plan_details: Structured training recommendations (JSONB)
        notes: Additional guidance
        created_at: When plan was generated
        updated_at: Last modification timestamp
    """

    id: UUID
    goal_id: UUID
    workout_frequency: int = Field(..., gt=0, le=7)
    primary_focus: str = Field(..., max_length=100)
    plan_details: dict[str, Any] = Field(
        ..., description="Structured training recommendations"
    )
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "goal_id": "223e4567-e89b-12d3-a456-426614174000",
                    "workout_frequency": 5,
                    "primary_focus": "Strength training + cardio for fat loss",
                    "plan_details": {
                        "strength_training": {
                            "frequency": 3,
                            "exercises": [
                                {
                                    "name": "Compound lifts",
                                    "sets": "3-4",
                                    "reps": "6-12",
                                    "rest": "2-3 minutes",
                                }
                            ],
                            "progression": "Maintain strength during deficit",
                        },
                        "cardio": {
                            "frequency": 2,
                            "type": "LISS or HIIT",
                            "duration": "20-30 minutes",
                            "intensity": "Zone 2 for fat burning",
                        },
                        "rest_days": 2,
                    },
                    "notes": "Prioritize recovery during deficit",
                    "created_at": "2025-10-27T10:00:00Z",
                    "updated_at": "2025-10-27T10:00:00Z",
                }
            ]
        },
    }


class DietPlanResponse(BaseModel):
    """Schema for diet plan response.

    Attributes:
        id: Diet plan ID
        goal_id: Associated goal ID
        daily_calorie_target: Total daily calories
        protein_grams: Daily protein target in grams
        carbs_grams: Daily carbs target in grams
        fat_grams: Daily fat target in grams
        meal_timing: Optional meal schedule (JSONB)
        guidelines: Nutritional advice text
        created_at: When plan was generated
        updated_at: Last modification timestamp
    """

    id: UUID
    goal_id: UUID
    daily_calorie_target: int = Field(..., ge=1200, le=5000)
    protein_grams: int = Field(..., ge=50, le=400)
    carbs_grams: int = Field(..., ge=50, le=800)
    fat_grams: int = Field(..., ge=20, le=200)
    meal_timing: Optional[dict[str, Any]] = Field(
        None, description="Optional meal schedule"
    )
    guidelines: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": "323e4567-e89b-12d3-a456-426614174000",
                    "goal_id": "223e4567-e89b-12d3-a456-426614174000",
                    "daily_calorie_target": 2200,
                    "protein_grams": 198,
                    "carbs_grams": 220,
                    "fat_grams": 61,
                    "meal_timing": {
                        "meals_per_day": 3,
                        "pre_workout": "30-60 min before: 40g carbs",
                        "post_workout": "Within 2h: 40g protein, 80g carbs",
                    },
                    "guidelines": (
                        "High protein (2.2g/kg) to preserve muscle. "
                        "Moderate carbs for training. Healthy fats."
                    ),
                    "created_at": "2025-10-27T10:00:00Z",
                    "updated_at": "2025-10-27T10:00:00Z",
                }
            ]
        },
    }


class MacronutrientBreakdown(BaseModel):
    """Macronutrient breakdown helper model.

    Attributes:
        protein_grams: Protein in grams
        protein_calories: Calories from protein
        protein_percentage: Percentage of total calories
        carbs_grams: Carbs in grams
        carbs_calories: Calories from carbs
        carbs_percentage: Percentage of total calories
        fat_grams: Fat in grams
        fat_calories: Calories from fat
        fat_percentage: Percentage of total calories
        total_calories: Sum of all macro calories
    """

    protein_grams: int
    protein_calories: int
    protein_percentage: float = Field(..., ge=0, le=100)
    carbs_grams: int
    carbs_calories: int
    carbs_percentage: float = Field(..., ge=0, le=100)
    fat_grams: int
    fat_calories: int
    fat_percentage: float = Field(..., ge=0, le=100)
    total_calories: int

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "protein_grams": 198,
                    "protein_calories": 792,
                    "protein_percentage": 36.0,
                    "carbs_grams": 220,
                    "carbs_calories": 880,
                    "carbs_percentage": 40.0,
                    "fat_grams": 61,
                    "fat_calories": 549,
                    "fat_percentage": 24.0,
                    "total_calories": 2221,
                }
            ]
        }
    }
