"""
Authentication router with login and token refresh endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.database import get_db
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from src.models.user import User
from src.schemas.auth import LoginRequest, RefreshTokenRequest, Token

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    Authenticate user and return access and refresh tokens.

    Args:
        credentials: User's email and password
        db: Database session

    Returns:
        Token: Access token, refresh token, and expiration info

    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    # Verify credentials
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=Token, status_code=status.HTTP_200_OK)
async def refresh_token(
    token_request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    Refresh access token using a valid refresh token.

    Implements token rotation: returns new access AND refresh tokens.

    Args:
        token_request: Refresh token
        db: Database session

    Returns:
        Token: New access token, new refresh token, and expiration info

    Raises:
        HTTPException 401: If refresh token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode refresh token
        payload = decode_token(token_request.refresh_token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")

        # Verify it's a refresh token
        if user_id is None or token_type != "refresh":
            raise credentials_exception

    except Exception:
        raise credentials_exception

    # Verify user still exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    # Create new tokens (token rotation)
    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
