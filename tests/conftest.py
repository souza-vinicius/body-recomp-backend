"""
Pytest configuration and fixtures for Body Recomp Backend testing.
"""
import asyncio
from typing import AsyncGenerator, Generator
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from src.core.database import Base
from src.api.main import app
from src.core.database import get_db
from src.core.config import settings

# Test database URL (using different database for tests)
TEST_DATABASE_URL = settings.DATABASE_URL.replace("/body_recomp", "/body_recomp_test")


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
    echo=False,
)

test_session_maker = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a test database session.
    Creates all tables before test and drops them after.
    """
    from sqlalchemy import text
    
    async with test_engine.begin() as conn:
        # Create enum types first
        await conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE gender AS ENUM ('male', 'female');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        
        await conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE calculationmethod AS ENUM ('navy', '3_site', '7_site');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        
        await conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE activitylevel AS ENUM (
                    'sedentary', 'lightly_active', 'moderately_active', 
                    'very_active', 'extremely_active'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        
        await conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE goaltype AS ENUM ('cutting', 'bulking');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        
        await conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE goalstatus AS ENUM ('active', 'completed', 'cancelled');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        
        # Now create all tables
        await conn.run_sync(Base.metadata.create_all)

    async with test_session_maker() as session:
        yield session
        await session.rollback()

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an HTTP client for testing API endpoints.
    """
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> dict:
    """
    Create a test user in the database.
    """
    from datetime import date
    from src.models.user import User
    from src.core.security import get_password_hash
    from src.models.enums import Gender, CalculationMethod, ActivityLevel

    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        date_of_birth=date(1990, 1, 1),
        gender=Gender.MALE,
        height_cm=175.0,
        preferred_calculation_method=CalculationMethod.NAVY,
        activity_level=ActivityLevel.MODERATELY_ACTIVE,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return {
        "id": str(user.id),
        "email": user.email,
        "password": "testpassword123",
        "full_name": user.full_name,
    }


@pytest_asyncio.fixture
async def auth_headers(test_user: dict) -> dict:
    """
    Get authentication headers with a valid JWT token.
    """
    from src.core.security import create_access_token
    
    token = create_access_token(data={"sub": test_user["id"]})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_measurement(
    db_session: AsyncSession, test_user: dict
) -> dict:
    """
    Create a test measurement for goal creation tests.
    """
    from datetime import datetime
    from src.models.measurement import BodyMeasurement
    from src.models.enums import CalculationMethod
    from decimal import Decimal
    
    measurement = BodyMeasurement(
        user_id=test_user["id"],
        weight_kg=Decimal("80.0"),
        calculation_method=CalculationMethod.NAVY,
        waist_cm=Decimal("90.0"),
        neck_cm=Decimal("38.0"),
        hip_cm=None,
        calculated_body_fat_percentage=Decimal("22.5"),
        measured_at=datetime.now(),
        created_at=datetime.now(),
    )
    
    db_session.add(measurement)
    await db_session.commit()
    await db_session.refresh(measurement)
    
    return {
        "id": str(measurement.id),
        "user_id": str(measurement.user_id),
        "weight_kg": float(measurement.weight_kg),
        "body_fat_percentage": float(
            measurement.calculated_body_fat_percentage
        ),
        "calculation_method": measurement.calculation_method.value,
    }


@pytest_asyncio.fixture
async def test_goal(
    db_session: AsyncSession, test_user: dict, test_measurement: dict
) -> dict:
    """
    Create a test goal for goal retrieval tests.
    """
    from datetime import datetime
    from src.models.goal import Goal
    from src.models.enums import GoalType, GoalStatus
    from decimal import Decimal
    
    goal = Goal(
        user_id=test_user["id"],
        goal_type=GoalType.CUTTING,
        status=GoalStatus.ACTIVE,
        initial_measurement_id=test_measurement["id"],
        initial_body_fat_percentage=Decimal("22.5"),
        target_body_fat_percentage=Decimal("15.0"),
        ceiling_body_fat_percentage=None,
        initial_weight_kg=Decimal("80.0"),
        target_calories=2200,
        estimated_weeks_to_goal=40,
        started_at=datetime.now(),
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    
    db_session.add(goal)
    await db_session.commit()
    await db_session.refresh(goal)
    
    return {
        "id": str(goal.id),
        "user_id": str(goal.user_id),
        "goal_type": goal.goal_type.value,
        "status": goal.status.value,
    }


@pytest_asyncio.fixture
async def other_user_goal(db_session: AsyncSession) -> dict:
    """
    Create another user with measurement and goal for isolation tests.
    """
    from datetime import datetime, date
    from src.models.user import User
    from src.models.measurement import BodyMeasurement
    from src.models.goal import Goal
    from src.models.enums import (
        Gender,
        CalculationMethod,
        ActivityLevel,
        GoalType,
        GoalStatus,
    )
    from src.core.security import get_password_hash
    from decimal import Decimal
    
    # Create other user
    other_user = User(
        email="other@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Other User",
        date_of_birth=date(1992, 3, 20),
        gender=Gender.FEMALE,
        height_cm=Decimal("165.0"),
        preferred_calculation_method=CalculationMethod.NAVY,
        activity_level=ActivityLevel.LIGHTLY_ACTIVE,
    )
    db_session.add(other_user)
    await db_session.flush()
    
    # Create measurement for other user
    other_measurement = BodyMeasurement(
        user_id=other_user.id,
        weight_kg=Decimal("65.0"),
        calculation_method=CalculationMethod.NAVY,
        waist_cm=Decimal("75.0"),
        neck_cm=Decimal("32.0"),
        hip_cm=Decimal("95.0"),
        calculated_body_fat_percentage=Decimal("25.0"),
        measured_at=datetime.now(),
        created_at=datetime.now(),
    )
    db_session.add(other_measurement)
    await db_session.flush()
    
    # Create goal for other user
    other_goal = Goal(
        user_id=other_user.id,
        goal_type=GoalType.CUTTING,
        status=GoalStatus.ACTIVE,
        initial_measurement_id=other_measurement.id,
        initial_body_fat_percentage=Decimal("25.0"),
        target_body_fat_percentage=Decimal("20.0"),
        ceiling_body_fat_percentage=None,
        initial_weight_kg=Decimal("65.0"),
        target_calories=1800,
        estimated_weeks_to_goal=30,
        started_at=datetime.now(),
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    db_session.add(other_goal)
    await db_session.commit()
    await db_session.refresh(other_goal)
    
    return {
        "id": str(other_goal.id),
        "user_id": str(other_user.id),
        "goal_type": other_goal.goal_type.value,
        "status": other_goal.status.value,
    }
