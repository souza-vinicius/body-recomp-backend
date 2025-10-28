"""
Goals API router for Body Recomp Backend.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.deps import get_current_user
from src.models.user import User
from src.models.goal import Goal
from src.schemas.goal import GoalCreate, GoalResponse
from src.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["Goals"])
goal_service = GoalService()


@router.post(
    "",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a body recomposition goal",
    description=(
        "Create a new cutting or bulking goal. "
        "The system calculates caloric targets and timeline estimates."
    ),
)
async def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Goal:
    """
    Create a new body recomposition goal.
    
    For **cutting goals**:
    - Provide `target_body_fat_percentage` (must be lower than initial)
    - System calculates caloric deficit (300-500 cal below TDEE)
    - Estimates timeline based on 0.5-1% BF loss per month
    
    For **bulking goals**:
    - Provide `ceiling_body_fat_percentage` (must be higher than initial)
    - System calculates caloric surplus (200-300 cal above TDEE)
    - Estimates timeline based on 0.1-0.3% BF gain per month
    
    **Validations**:
    - Only one active goal allowed per user (FR-018)
    - Initial measurement must exist and belong to user
    - Goal must meet safety limits (FR-017):
      - Cutting: target >= 8% (men) or >= 15% (women)
      - Bulking: ceiling <= 30%
    
    Returns the created goal with calculated caloric targets and timeline.
    """
    try:
        goal = await goal_service.create_goal(
            db=db,
            user_id=current_user.id,
            goal_data=goal_data,
        )
        await db.commit()
        await db.refresh(goal)
        return goal
    except ValueError as e:
        error_msg = str(e)
        # Check if it's an active goal conflict (should be 403 per OpenAPI spec)
        if "already has an active goal" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=error_msg,
            )
        # Other validation errors are 400
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )


@router.get(
    "/{goal_id}",
    response_model=GoalResponse,
    summary="Get a goal by ID",
    description="Retrieve details of a specific goal.",
)
async def get_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Goal:
    """
    Get a goal by ID.
    
    Returns goal details including:
    - Goal type (cutting/bulking)
    - Current status (active/completed/cancelled)
    - Initial measurements
    - Target calories
    - Timeline estimate
    
    **Access control**:
    - Users can only access their own goals
    - Returns 404 if goal doesn't exist or belongs to another user
    """
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id)
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )
    
    # Ensure user can only access their own goals
    if goal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )
    
    return goal
