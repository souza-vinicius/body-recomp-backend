"""
FastAPI dependencies for authentication and authorization.
"""
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.security import decode_token
from src.models.user import User
from src.schemas.user import UserResponse

# Security scheme for JWT Bearer token
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """
    Get the current authenticated user from JWT token.

    Args:
        credentials: JWT Bearer token credentials
        db: Database session

    Returns:
        Current user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    # Decode token
    payload = decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user ID from payload
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Query user from database
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Convert to response schema
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        date_of_birth=user.date_of_birth,
        gender=user.gender,
        height_cm=user.height_cm,
        preferred_calculation_method=user.preferred_calculation_method,
        activity_level=user.activity_level,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


async def require_active_goal(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """
    Require that the current user has an active goal.

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Current user if they have an active goal

    Raises:
        HTTPException: If user doesn't have an active goal
    """
    # Import here to avoid circular dependency

    # Check for active goal
    # NOTE: This will be fully implemented once Goal model is created
    # For now, we'll just return the user
    # TODO: Uncomment when Goal model is available
    # from src.models.goal import Goal
    # result = await db.execute(
    #     select(Goal).where(
    #         Goal.user_id == current_user.id,
    #         Goal.status == GoalStatus.ACTIVE
    #     )
    # )
    # goal = result.scalar_one_or_none()
    #
    # if goal is None:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="No active goal found. Please create a goal first.",
    #     )

    return current_user


# Type aliases for dependency injection
CurrentUser = Annotated[UserResponse, Depends(get_current_user)]
UserWithActiveGoal = Annotated[UserResponse, Depends(require_active_goal)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]
