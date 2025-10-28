"""
Users API router for Body Recomp Backend.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.deps import get_current_user
from src.core.security import get_password_hash
from src.models.user import User
from src.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password.",
)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Register a new user.
    
    - **email**: Valid email address (must be unique)
    - **password**: Minimum 8 characters
    - **full_name**: User's full name
    - **date_of_birth**: User's date of birth
    - **gender**: male or female
    - **height_cm**: Height in centimeters (120-250)
    - **preferred_calculation_method**: navy, 3_site, or 7_site
    - **activity_level**: sedentary, lightly_active, etc.
    
    Returns the created user (password excluded).
    """
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password
    try:
        hashed_password = get_password_hash(user_data.password)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password hashing failed: {str(e)}",
        )
    
    # Create user
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        date_of_birth=user_data.date_of_birth,
        gender=user_data.gender,
        height_cm=user_data.height_cm,
        preferred_calculation_method=user_data.preferred_calculation_method,
        activity_level=user_data.activity_level,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Get the profile of the currently authenticated user.",
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current authenticated user's profile.
    
    Requires valid JWT token in Authorization header.
    
    Returns the user profile (password excluded).
    """
    return current_user
