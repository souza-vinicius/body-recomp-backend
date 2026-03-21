"""
Plans router for Body Recomp Backend.

Provides endpoints for retrieving training and diet plans.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_db
from src.models.goal import Goal
from src.models.plan import DietPlan, TrainingPlan
from src.models.user import User
from src.schemas.plan import DietPlanResponse, TrainingPlanResponse

router = APIRouter(prefix="/goals", tags=["plans"])


@router.get(
    "/{goal_id}/training-plan",
    response_model=TrainingPlanResponse,
    status_code=status.HTTP_200_OK,
)
async def get_training_plan(
    goal_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get training plan for a specific goal.

    Returns the personalized training plan including:
    - Workout frequency and schedule
    - Exercise selection and progression
    - Training split and focus areas

    Requires authentication. Users can only access their own goal plans.
    """
    # Verify goal exists and belongs to current user
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id).where(Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    # Get training plan
    result = await db.execute(
        select(TrainingPlan).where(TrainingPlan.goal_id == goal_id)
    )
    training_plan = result.scalar_one_or_none()

    if not training_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training plan not found for this goal",
        )

    return training_plan


@router.get(
    "/{goal_id}/diet-plan",
    response_model=DietPlanResponse,
    status_code=status.HTTP_200_OK,
)
async def get_diet_plan(
    goal_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get diet plan for a specific goal.

    Returns the personalized diet plan including:
    - Daily calorie target
    - Macronutrient breakdown (protein, carbs, fat)
    - Meal timing recommendations
    - Diet guidelines and tips

    Requires authentication. Users can only access their own goal plans.
    """
    # Verify goal exists and belongs to current user
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id).where(Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    # Get diet plan
    result = await db.execute(select(DietPlan).where(DietPlan.goal_id == goal_id))
    diet_plan = result.scalar_one_or_none()

    if not diet_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diet plan not found for this goal",
        )

    return diet_plan
