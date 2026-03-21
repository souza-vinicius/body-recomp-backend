"""
Database configuration and session management for Body Recomp Backend.
Uses SQLAlchemy 2.0 async for PostgreSQL connections.
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base

from src.core.config import settings

# Create async engine with production-grade connection pooling
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    # Connection pool configuration for production
    pool_size=20,  # Number of connections to maintain in the pool
    max_overflow=10,  # Additional connections allowed under high load
    pool_timeout=30,  # Seconds to wait for a connection from the pool
    pool_pre_ping=True,  # Verify connection health before using
    pool_recycle=3600,  # Recycle connections after 1 hour
)

# Create async session maker
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create declarative base for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.
    Yields an async session and ensures it's closed after use.
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
