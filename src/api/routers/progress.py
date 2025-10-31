"""Progress tracking API routes.

Endpoints for logging progress and viewing trends.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.deps import get_current_user
from src.models.user import User
from src.services.progress_service import ProgressService
from src.services.goal_service import GoalService
from src.schemas.progress import (
    ProgressEntryCreate,
    ProgressEntryResponse,
    TrendsResponse
)

router = APIRouter(prefix="/goals", tags=["progress"])


@router.post(
    "/{goal_id}/progress",
    response_model=ProgressEntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log progress entry",
    description=(
        "Create a weekly progress entry by linking a new measurement to a goal. "
        "Requires at least 7 days since last entry or goal start."
    )
)
async def create_progress_entry(
    goal_id: UUID,
    progress_data: ProgressEntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ProgressEntryResponse:
    """
    Log a new progress entry for a goal.
    
    Args:
        goal_id: Goal to log progress for
        progress_data: Progress entry creation data
        db: Database session
        
    Returns:
        Created progress entry
        
    Raises:
        404: Goal or measurement not found
        400: Too soon since last entry or other validation error
    """
    progress_service = ProgressService(db)
    goal_service = GoalService()
    
    # Verify goal exists and belongs to current user
    from sqlalchemy import select
    from src.models.goal import Goal
    
    goal_result = await db.execute(
        select(Goal).where(Goal.id == goal_id)
    )
    goal = goal_result.scalar_one_or_none()
    
    if not goal or goal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    try:
        # Log progress
        progress_entry = await progress_service.log_progress(
            goal_id=goal_id,
            measurement_id=progress_data.measurement_id,
            notes=progress_data.notes
        )
        
        # Check if goal is now completed
        await goal_service.check_goal_completion(
            db=db,
            goal_id=goal_id,
            current_body_fat=progress_entry.body_fat_percentage
        )
        
        return ProgressEntryResponse.model_validate(progress_entry)
        
    except ValueError as e:
        # Handle validation errors (measurement not found, too soon, etc.)
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )


@router.get(
    "/{goal_id}/progress",
    response_model=list[ProgressEntryResponse],
    summary="Get progress history",
    description="Retrieve all progress entries for a goal, ordered chronologically"
)
async def get_progress_history(
    goal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> list[ProgressEntryResponse]:
    """
    Get all progress entries for a goal.
    
    Args:
        goal_id: Goal to retrieve progress for
        db: Database session
        
    Returns:
        List of progress entries ordered by week number
        
    Raises:
        404: Goal not found
    """
    from sqlalchemy import select
    from src.models.progress import ProgressEntry
    from src.models.goal import Goal
    
    # Verify goal exists and belongs to current user
    goal_result = await db.execute(
        select(Goal).where(Goal.id == goal_id)
    )
    goal = goal_result.scalar_one_or_none()
    
    if not goal or goal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Get all progress entries ordered by week number
    result = await db.execute(
        select(ProgressEntry)
        .where(ProgressEntry.goal_id == goal_id)
        .order_by(ProgressEntry.week_number)
    )
    progress_entries = result.scalars().all()
    
    return [
        ProgressEntryResponse.model_validate(entry)
        for entry in progress_entries
    ]


@router.get(
    "/{goal_id}/trends",
    response_model=TrendsResponse,
    summary="Get progress trends",
    description=(
        "Retrieve aggregated progress trends and analysis with adjustment "
        "suggestions"
    )
)
async def get_progress_trends(
    goal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> TrendsResponse:
    """
    Get progress trends and analysis for a goal.
    
    Args:
        goal_id: Goal to analyze
        db: Database session
        
    Returns:
        Trends analysis with recommendations
        
    Raises:
        404: Goal not found
    """
    progress_service = ProgressService(db)
    
    # Verify goal exists and belongs to current user
    from sqlalchemy import select
    from src.models.goal import Goal
    
    goal_result = await db.execute(
        select(Goal).where(Goal.id == goal_id)
    )
    goal = goal_result.scalar_one_or_none()
    
    if not goal or goal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    try:
        trends = await progress_service.get_trends(goal_id=goal_id)
        return trends
        
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
