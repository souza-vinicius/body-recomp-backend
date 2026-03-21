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
    get_password_hash,
)
from src.models.user import User
from src.schemas.auth import LoginRequest, RefreshTokenRequest, Token, GoogleLoginRequest, GoogleRegisterRequest
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import secrets

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


@router.post("/google/login", response_model=Token, status_code=status.HTTP_200_OK)
async def google_login(
    request: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    Authenticate user via Google SSO.
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
    else:
        # Not found, redirect to SSO register
        raise HTTPException(
            status_code=404, 
            detail={
                "message": "User not found", 
                "sso_data": {
                    "email": email,
                    "name": idinfo.get("name", ""),
                    "picture": idinfo.get("picture", "")
                }
            }
        )


@router.post("/google/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def google_register(
    request: GoogleRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    Complete user registration via Google SSO.
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

    email = idinfo.get("email")
    name = idinfo.get("name", "Google User")

    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already registered")

    # Generate a strong random password since they use Google
    random_password = secrets.token_urlsafe(32)
    
    new_user = User(
        email=email,
        hashed_password=get_password_hash(random_password),
        full_name=name,
        date_of_birth=request.date_of_birth,
        gender=request.gender,
        height_cm=request.height_cm,
        preferred_calculation_method=request.preferred_calculation_method,
        activity_level=request.activity_level
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
