# CLAUDE.md - AI Assistant Guide for Body Recomp Backend

> **Last Updated**: 2025-11-22
> **Purpose**: This document provides comprehensive guidance for AI assistants (like Claude) working on the Body Recomp Backend codebase.

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture & Structure](#architecture--structure)
- [Technology Stack](#technology-stack)
- [Development Setup](#development-setup)
- [Code Conventions](#code-conventions)
- [Database Patterns](#database-patterns)
- [API Patterns](#api-patterns)
- [Testing Patterns](#testing-patterns)
- [Common Tasks](#common-tasks)
- [Important Gotchas](#important-gotchas)

---

## Project Overview

**Body Recomp Backend** is a production-ready FastAPI application for tracking body recomposition goals (cutting/bulking). It provides automated training and diet plan generation based on evidence-based calculations.

### Key Features
- **Goal Management**: Cutting (fat loss) and bulking (muscle gain) goals
- **Progress Tracking**: Body measurements, progress entries, on-track calculations
- **Automated Plans**: Training and diet plans generated based on goal type
- **Scientific Calculations**: BMR (Mifflin-St Jeor), TDEE, body fat % (Navy/skinfold methods)
- **JWT Authentication**: Secure user authentication with token refresh
- **RFC 7807 Error Handling**: Standardized error responses

### Domain Concepts
- **Cutting**: Fat loss while preserving muscle (15-20% caloric deficit, high protein)
- **Bulking**: Muscle gain with minimal fat (10-15% caloric surplus, moderate protein)
- **Body Fat Calculation**: Navy method (circumferences) or skinfold methods (3-site/7-site)
- **Progress Tracking**: Weekly check-ins with on-track status determination

---

## Architecture & Structure

### Directory Organization

```
body-recomp-backend/
├── src/                          # Main application code (4,712 LOC)
│   ├── api/                      # API layer
│   │   ├── main.py              # FastAPI app initialization, middleware, error handlers
│   │   └── routers/             # Route handlers (auth, users, measurements, goals, progress, plans)
│   ├── core/                     # Core infrastructure
│   │   ├── config.py            # Pydantic Settings configuration
│   │   ├── database.py          # SQLAlchemy async engine & session management
│   │   ├── security.py          # JWT & password hashing utilities
│   │   └── deps.py              # FastAPI dependency injection
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── user.py              # User authentication & profile
│   │   ├── measurement.py       # Body measurements with BF% calculations
│   │   ├── goal.py              # Goals with computed properties & relationships
│   │   ├── plan.py              # Training & diet plans (JSONB storage)
│   │   ├── progress.py          # Progress entries
│   │   └── enums.py             # Domain enums (GoalType, GoalStatus, etc.)
│   ├── schemas/                  # Pydantic request/response schemas
│   ├── services/                 # Business logic layer
│   │   ├── goal_service.py      # Goal creation, BMR/TDEE calculation, timeline estimation
│   │   ├── body_fat_calculator.py # Body fat % calculation methods
│   │   ├── plan_generator.py    # Training & diet plan generation
│   │   ├── progress_service.py  # Progress tracking & analysis
│   │   ├── validation_service.py # Business rule validation
│   │   └── cache.py             # In-memory caching for calculations
│   └── utils/                    # Utility functions
├── tests/                        # Test suite (189/200 passing, 76.41% coverage)
│   ├── contract/                # API contract tests
│   ├── integration/             # Integration tests
│   ├── unit/                    # Unit tests
│   └── conftest.py              # Pytest fixtures & test database setup
├── alembic/                      # Database migrations
│   ├── versions/                # Migration files
│   └── env.py                   # Alembic configuration
├── scripts/                      # Deployment & utility scripts
│   ├── init.sh                  # Production startup (wait for DB, run migrations)
│   ├── deploy.sh                # Deployment automation
│   └── backup.sh                # Database backup
├── specs/                        # Project specifications & planning
│   └── 001-body-recomp-goals/   # Feature specifications, plans, tasks
├── docs/                         # Documentation
│   └── EASYPANEL_DEPLOY.md      # EasyPanel deployment guide
├── .env.example                  # Environment variable template
├── pyproject.toml               # Poetry dependencies & tool configuration
├── docker-compose.yml           # Production Docker setup
└── docker-compose.dev.yml       # Development Docker setup
```

### Architectural Layers

```
┌─────────────────────────────────────────┐
│  API Layer (routers/)                   │  ← FastAPI route handlers
│  - Request validation (Pydantic)        │
│  - Response serialization               │
│  - JWT authentication                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Service Layer (services/)              │  ← Business logic
│  - Goal calculations (BMR, TDEE)        │
│  - Body fat calculations                │
│  - Plan generation                      │
│  - Progress analysis                    │
│  - Validation rules                     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Data Layer (models/)                   │  ← SQLAlchemy ORM
│  - Database entities                    │
│  - Relationships                        │
│  - Computed properties                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  PostgreSQL Database                    │
└─────────────────────────────────────────┘
```

### Key Design Patterns
- **Layered Architecture**: Clear separation of API, business logic, and data layers
- **Dependency Injection**: FastAPI's `Depends()` for database sessions and auth
- **Repository Pattern**: Services abstract database operations
- **DTO Pattern**: Pydantic schemas separate internal models from API contracts
- **Factory Pattern**: Plan generator creates goal-specific plans

---

## Technology Stack

### Core Framework
- **Python 3.11+**: Modern Python features (type hints, async/await)
- **FastAPI 0.104+**: High-performance async web framework
- **Uvicorn**: ASGI server with `[standard]` extras (for production)

### Database & ORM
- **PostgreSQL 15+**: Primary database
- **SQLAlchemy 2.0**: Async ORM with `asyncpg` driver
- **Alembic 1.12+**: Database migration management

### Authentication & Security
- **python-jose[cryptography]**: JWT token handling (HS256 algorithm)
- **passlib[bcrypt]**: Password hashing (12 rounds, cost factor)
- **email-validator**: Email format validation

### Validation & Configuration
- **Pydantic 2.0+**: Request/response validation, settings management
- **pydantic-settings**: Environment variable parsing

### Development & Quality
- **pytest**: Testing framework with `asyncio_mode = auto`
- **pytest-asyncio**: Async test support
- **pytest-cov**: Coverage reporting (target: 79%+)
- **httpx**: Async HTTP client for tests
- **ruff**: Fast Python linter (line length: 100)
- **black**: Code formatter (line length: 100)
- **mypy**: Static type checking (strict mode)

### Deployment
- **Docker & Docker Compose**: Containerization
- **Poetry 1.6.1**: Dependency management

---

## Development Setup

### Environment Variables

**Required variables** (defined in `.env`):

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/body_recomp

# Security
SECRET_KEY=your-secret-key-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
DEBUG=true

# CORS - supports three formats:
# 1. Single: https://example.com
# 2. CSV: https://example.com,https://app.com
# 3. JSON: ["https://example.com","https://app.com"]
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Local Development Commands

```bash
# Install dependencies
poetry install

# Run migrations
alembic upgrade head

# Start development server (with auto-reload)
uvicorn src.api.main:app --reload

# Run tests
pytest tests/ -v

# Run tests with coverage
pytest tests/ --cov=src --cov-report=html

# Run linter
ruff check .

# Format code
black .

# Type checking
mypy src/
```

### Docker Development

```bash
# Start all services (PostgreSQL + API)
docker-compose -f docker-compose.dev.yml up -d

# Run migrations in container
docker-compose -f docker-compose.dev.yml exec api alembic upgrade head

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Shell into container
docker-compose -f docker-compose.dev.yml exec api bash

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Database Setup

**PostgreSQL connection pooling** (configured in `src/core/database.py`):
- Pool size: 20 connections
- Max overflow: 10 additional connections
- Pool timeout: 30 seconds
- Pool pre-ping: Enabled (connection health checks)
- Connection recycle: 3600 seconds (1 hour)

**Test database** uses `NullPool` to prevent connection issues during parallel tests.

---

## Code Conventions

### Python Style Guide

**Follow PEP 8** with these specific rules:

```python
# Line length: 100 characters (enforced by ruff & black)
# Target version: Python 3.11
# Import organization: ruff handles this automatically (isort rules)

# Type hints REQUIRED for all function signatures
async def create_goal(
    db: AsyncSession,
    user_id: UUID,
    goal_data: GoalCreate,
) -> Goal:
    """
    Create a new goal with automated plan generation.

    Args:
        db: Database session
        user_id: ID of the user creating the goal
        goal_data: Goal creation data

    Returns:
        Created goal with relationships loaded

    Raises:
        ValueError: If validation fails
    """
    pass
```

### Naming Conventions

```python
# Files: snake_case
# Examples: goal_service.py, body_fat_calculator.py

# Classes: PascalCase
class GoalService:
    pass

# Functions/methods: snake_case
async def calculate_bmr(weight_kg: float, height_cm: float) -> float:
    pass

# Constants: UPPER_SNAKE_CASE
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Private members: _leading_underscore
def _internal_helper() -> None:
    pass

# Database models: PascalCase (singular)
class Goal(Base):
    __tablename__ = "goals"  # plural
```

### Import Organization

```python
# Standard library
import logging
from datetime import datetime, timedelta
from typing import Optional

# Third-party
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Local application
from src.core.deps import get_current_user, get_db
from src.models.goal import Goal
from src.schemas.goal import GoalCreate, GoalResponse
from src.services.goal_service import GoalService
```

### Async/Await Patterns

```python
# ALWAYS use async for:
# - Database operations
# - API route handlers
# - Service methods that call DB or external APIs

# Example route handler
@router.post("/goals", response_model=GoalResponse)
async def create_goal(
    goal_data: GoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Goal:
    service = GoalService(db)
    return await service.create_goal(current_user.id, goal_data)

# Example service method
async def create_goal(self, user_id: UUID, goal_data: GoalCreate) -> Goal:
    # Async database query
    result = await self.db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one()

    # Business logic...
    goal = Goal(**goal_data.model_dump(), user_id=user_id)
    self.db.add(goal)
    await self.db.commit()
    await self.db.refresh(goal)
    return goal
```

### Error Handling

```python
# Use specific exceptions from FastAPI
from fastapi import HTTPException, status

# Client errors (4xx)
if not user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )

# Business logic errors - use ValueError (caught by exception handler)
if target_bf_percentage < 5.0:
    raise ValueError(
        "Target body fat percentage cannot be below 5% for safety reasons"
    )

# RFC 7807 format is automatically applied by main.py exception handlers
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# Use structured logging with context
logger.info(
    f"Goal created: {goal.id}",
    extra={
        "goal_id": str(goal.id),
        "user_id": str(user.id),
        "goal_type": goal.goal_type,
    }
)

# Error logging with exception info
try:
    result = await calculate_something()
except Exception as e:
    logger.error(
        f"Calculation failed: {e}",
        exc_info=True,  # Include stack trace
        extra={"user_id": str(user_id)}
    )
    raise
```

---

## Database Patterns

### Model Definition

```python
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base

class Goal(Base):
    __tablename__ = "goals"

    # Primary key - always UUID
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # Foreign keys - use UUID type
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    # Required fields - Mapped[type]
    goal_type: Mapped[str] = mapped_column(String(20))
    current_bf_percentage: Mapped[float]

    # Optional fields - Mapped[Optional[type]]
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps - server_default for created_at, onupdate for updated_at
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships - back_populates on both sides
    user: Mapped["User"] = relationship("User", back_populates="goals")
    progress_entries: Mapped[list["ProgressEntry"]] = relationship(
        "ProgressEntry",
        back_populates="goal",
        cascade="all, delete-orphan"  # Delete progress when goal deleted
    )

    # Computed properties - use @property decorator
    @property
    def progress_percentage(self) -> float:
        """Calculate goal progress as a percentage."""
        # Implementation...
        return 0.0
```

### Query Patterns

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

# Simple query
async def get_user(db: AsyncSession, user_id: UUID) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()

# Query with relationships eagerly loaded
async def get_goal_with_relations(db: AsyncSession, goal_id: UUID) -> Optional[Goal]:
    result = await db.execute(
        select(Goal)
        .options(
            selectinload(Goal.user),
            selectinload(Goal.progress_entries),
            selectinload(Goal.training_plan),
        )
        .where(Goal.id == goal_id)
    )
    return result.scalar_one_or_none()

# Filter with multiple conditions
async def get_active_goals(db: AsyncSession, user_id: UUID) -> list[Goal]:
    result = await db.execute(
        select(Goal)
        .where(Goal.user_id == user_id)
        .where(Goal.status == GoalStatus.ACTIVE)
        .order_by(Goal.created_at.desc())
    )
    return list(result.scalars().all())

# Create
async def create_goal(db: AsyncSession, goal: Goal) -> Goal:
    db.add(goal)
    await db.commit()
    await db.refresh(goal)  # Load generated values (id, timestamps)
    return goal

# Update
async def update_goal(db: AsyncSession, goal: Goal, updates: dict) -> Goal:
    for key, value in updates.items():
        setattr(goal, key, value)
    await db.commit()
    await db.refresh(goal)
    return goal

# Delete
async def delete_goal(db: AsyncSession, goal: Goal) -> None:
    await db.delete(goal)
    await db.commit()
```

### Migration Patterns

```python
# alembic/versions/YYYYMMDD_HHMM_description.py

def upgrade() -> None:
    # Create table
    op.create_table(
        "goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("goal_type", sa.String(20), nullable=False),
        sa.Column("current_bf_percentage", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.CheckConstraint("current_bf_percentage >= 5.0 AND current_bf_percentage <= 50.0"),
    )

    # Create indexes
    op.create_index("ix_goals_user_id", "goals", ["user_id"])
    op.create_index("ix_goals_user_id_status", "goals", ["user_id", "status"])

def downgrade() -> None:
    op.drop_table("goals")
```

---

## API Patterns

### Router Structure

```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import get_current_user, get_db
from src.models.user import User
from src.schemas.goal import GoalCreate, GoalResponse
from src.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["goals"])

@router.post(
    "",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new goal",
    description="Create a cutting or bulking goal with automated plan generation",
)
async def create_goal(
    goal_data: GoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Goal:
    """
    Create a new body recomposition goal.

    - **goal_type**: "cutting" or "bulking"
    - **current_bf_percentage**: Current body fat percentage (5-50%)
    - **target_bf_percentage**: Target body fat percentage
    """
    service = GoalService(db)
    return await service.create_goal(current_user.id, goal_data)
```

### Schema Patterns

```python
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Request schemas - validation rules
class GoalCreate(BaseModel):
    """Schema for creating a new goal."""
    goal_type: str = Field(..., pattern="^(cutting|bulking)$")
    current_bf_percentage: float = Field(..., ge=5.0, le=50.0)
    target_bf_percentage: float = Field(..., ge=5.0, le=50.0)
    notes: Optional[str] = Field(None, max_length=1000)

# Response schemas - from database models
class GoalResponse(BaseModel):
    """Schema for goal responses."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    goal_type: str
    current_bf_percentage: float
    target_bf_percentage: float
    status: str
    created_at: datetime
    updated_at: datetime

    # Computed properties from model
    progress_percentage: float
    weeks_elapsed: int
    is_on_track: bool

# Nested schemas
class GoalWithPlansResponse(GoalResponse):
    """Goal with training and diet plans included."""
    training_plan: Optional["TrainingPlanResponse"]
    diet_plan: Optional["DietPlanResponse"]
```

### Authentication Pattern

```python
# src/core/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db_session
from src.core.security import decode_token
from src.models.user import User

security = HTTPBearer()

async def get_current_user(
    db: AsyncSession = Depends(get_db_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """Extract and validate current user from JWT token."""
    token = credentials.credentials

    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
```

---

## Testing Patterns

### Test Structure

```
tests/
├── conftest.py                    # Shared fixtures
├── contract/                      # API contract tests (end-to-end)
│   ├── test_auth_endpoints.py
│   ├── test_goal_endpoints.py
│   └── test_progress_endpoints.py
├── integration/                   # Integration tests (multiple components)
│   ├── test_goal_creation.py
│   └── test_progress_tracking.py
└── unit/                         # Unit tests (single component)
    ├── test_body_fat_calculator.py
    ├── test_goal_service.py
    └── test_plan_generator.py
```

### Fixtures (conftest.py)

```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool

from src.api.main import app
from src.core.database import Base, get_db_session

# Test database engine (NullPool prevents connection issues)
test_engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/body_recomp_test",
    poolclass=NullPool,
)

@pytest.fixture
async def db_session() -> AsyncSession:
    """Provide a test database session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(test_engine) as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    """Provide an async HTTP test client."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        email="test@example.com",
        hashed_password=hash_password("testpassword"),
        full_name="Test User",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def auth_headers(test_user: User) -> dict:
    """Provide authentication headers with valid JWT."""
    token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}
```

### Test Examples

```python
# Contract test (API endpoint)
@pytest.mark.asyncio
async def test_create_goal(client: AsyncClient, auth_headers: dict):
    """Test goal creation endpoint."""
    response = await client.post(
        "/api/v1/goals",
        json={
            "goal_type": "cutting",
            "current_bf_percentage": 20.0,
            "target_bf_percentage": 15.0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["goal_type"] == "cutting"
    assert data["current_bf_percentage"] == 20.0
    assert "id" in data

# Unit test (service logic)
@pytest.mark.asyncio
async def test_calculate_bmr():
    """Test BMR calculation using Mifflin-St Jeor equation."""
    service = GoalService(mock_db)

    bmr = service.calculate_bmr(
        weight_kg=80.0,
        height_cm=180.0,
        age=30,
        gender="male"
    )

    # Expected: (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 1780
    assert bmr == pytest.approx(1780.0, rel=0.01)

# Integration test (multiple components)
@pytest.mark.asyncio
async def test_goal_creation_workflow(db_session: AsyncSession, test_user: User):
    """Test complete goal creation with plan generation."""
    # Create measurement
    measurement = BodyMeasurement(
        user_id=test_user.id,
        weight_kg=80.0,
        # ... other fields
    )
    db_session.add(measurement)
    await db_session.commit()

    # Create goal
    service = GoalService(db_session)
    goal = await service.create_goal(test_user.id, goal_data)

    # Verify goal
    assert goal.status == GoalStatus.ACTIVE
    assert goal.training_plan is not None
    assert goal.diet_plan is not None
```

### Running Tests

```bash
# All tests
pytest tests/ -v

# Specific test file
pytest tests/unit/test_goal_service.py -v

# Specific test
pytest tests/unit/test_goal_service.py::test_calculate_bmr -v

# With coverage
pytest tests/ --cov=src --cov-report=html

# Coverage report opens in: htmlcov/index.html
```

---

## Common Tasks

### Adding a New API Endpoint

1. **Define schema** in `src/schemas/`:
```python
# src/schemas/new_feature.py
class NewFeatureCreate(BaseModel):
    name: str
    value: float

class NewFeatureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    value: float
```

2. **Create router** in `src/api/routers/`:
```python
# src/api/routers/new_feature.py
router = APIRouter(prefix="/new-feature", tags=["new-feature"])

@router.post("", response_model=NewFeatureResponse)
async def create_new_feature(
    data: NewFeatureCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Implementation
    pass
```

3. **Mount router** in `src/api/main.py`:
```python
from src.api.routers import new_feature

app.include_router(new_feature.router, prefix="/api/v1")
```

4. **Write tests** in `tests/contract/`:
```python
# tests/contract/test_new_feature_endpoints.py
async def test_create_new_feature(client: AsyncClient, auth_headers: dict):
    response = await client.post(
        "/api/v1/new-feature",
        json={"name": "test", "value": 42.0},
        headers=auth_headers,
    )
    assert response.status_code == 201
```

### Adding a Database Model

1. **Create model** in `src/models/`:
```python
# src/models/new_model.py
class NewModel(Base):
    __tablename__ = "new_models"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # ... fields
```

2. **Create migration**:
```bash
alembic revision -m "create new_models table"
```

3. **Edit migration** in `alembic/versions/`:
```python
def upgrade() -> None:
    op.create_table(
        "new_models",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        # ... columns
    )

def downgrade() -> None:
    op.drop_table("new_models")
```

4. **Apply migration**:
```bash
alembic upgrade head
```

### Adding Business Logic

1. **Create service** in `src/services/`:
```python
# src/services/new_service.py
class NewService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def perform_action(self, user_id: UUID, data: dict) -> Result:
        # Business logic
        pass
```

2. **Use in router**:
```python
@router.post("/action")
async def perform_action(
    data: ActionData,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = NewService(db)
    return await service.perform_action(current_user.id, data)
```

3. **Write unit tests** in `tests/unit/`:
```python
# tests/unit/test_new_service.py
async def test_perform_action():
    service = NewService(mock_db)
    result = await service.perform_action(user_id, data)
    assert result.success is True
```

---

## Important Gotchas

### 1. Database Sessions

**Problem**: Accessing lazy-loaded relationships after session closes
```python
# ❌ BAD - Will fail after session closes
async def get_goal(db: AsyncSession, goal_id: UUID) -> Goal:
    result = await db.execute(select(Goal).where(Goal.id == goal_id))
    return result.scalar_one()  # progress_entries not loaded!

# Later...
goal = await get_goal(db, goal_id)
# Session closed!
print(goal.progress_entries)  # ❌ Error: DetachedInstanceError

# ✅ GOOD - Eagerly load relationships
async def get_goal(db: AsyncSession, goal_id: UUID) -> Goal:
    result = await db.execute(
        select(Goal)
        .options(selectinload(Goal.progress_entries))
        .where(Goal.id == goal_id)
    )
    return result.scalar_one()
```

### 2. Async/Await

**Problem**: Forgetting `await` on async functions
```python
# ❌ BAD - Returns coroutine, not result
result = service.create_goal(user_id, data)  # Missing await!

# ✅ GOOD
result = await service.create_goal(user_id, data)
```

### 3. Pydantic Model Validation

**Problem**: Not using `.model_dump()` when creating SQLAlchemy models
```python
# ❌ BAD - Pydantic model, not dict
goal = Goal(**goal_data)  # goal_data is GoalCreate (Pydantic)

# ✅ GOOD
goal = Goal(**goal_data.model_dump())
```

### 4. UUID Type Consistency

**Problem**: Mixing string and UUID types
```python
# ❌ BAD - String instead of UUID
user_id = "550e8400-e29b-41d4-a716-446655440000"
result = await db.execute(select(User).where(User.id == user_id))

# ✅ GOOD - Use UUID type
from uuid import UUID
user_id = UUID("550e8400-e29b-41d4-a716-446655440000")
result = await db.execute(select(User).where(User.id == user_id))
```

### 5. Commit and Refresh

**Problem**: Not refreshing after commit to get generated values
```python
# ❌ BAD - Missing refresh, computed fields not loaded
goal = Goal(**goal_data.model_dump())
db.add(goal)
await db.commit()
return goal  # Missing id, timestamps!

# ✅ GOOD - Refresh to load generated values
goal = Goal(**goal_data.model_dump())
db.add(goal)
await db.commit()
await db.refresh(goal)  # Load id, created_at, updated_at
return goal
```

### 6. Test Database Isolation

**Problem**: Tests interfering with each other
```python
# ❌ BAD - Shared database state between tests
# Tests may fail randomly depending on order

# ✅ GOOD - Use transaction rollback or recreate schema per test
# See conftest.py fixtures for proper isolation
```

### 7. CORS Configuration

**Problem**: CORS errors in development
```python
# ✅ Make sure ALLOWED_ORIGINS includes your frontend URL
# .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 8. Migration Order

**Problem**: Applying migrations out of order
```bash
# ❌ BAD - Manually editing old migrations
# ❌ BAD - Creating migrations with same timestamp

# ✅ GOOD - Always create new migrations
alembic revision -m "fix something"

# ✅ GOOD - Apply in order
alembic upgrade head
```

### 9. Password Hashing

**Problem**: Storing plain text passwords
```python
# ❌ BAD
user.password = "plaintext123"

# ✅ GOOD - Use hash_password from security.py
from src.core.security import hash_password
user.hashed_password = hash_password("plaintext123")
```

### 10. Token Expiration

**Problem**: Not handling token refresh
```python
# ✅ Frontend should refresh tokens before expiration
# Access token: 30 minutes
# Refresh token: 7 days
# Use /api/v1/auth/refresh endpoint
```

---

## Quick Reference

### Key Files to Check First
1. `src/api/main.py` - App initialization, middleware, error handlers
2. `src/core/config.py` - Environment configuration
3. `src/core/database.py` - Database connection setup
4. `src/models/` - Database schema
5. `src/api/routers/` - API endpoints
6. `src/services/` - Business logic

### Important URLs (Development)
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

### Database Commands
```bash
# Create migration
alembic revision -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current revision
alembic current

# Show migration history
alembic history
```

### Docker Commands
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Run migrations
docker-compose exec api alembic upgrade head

# Shell into container
docker-compose exec api bash

# Stop and remove
docker-compose down
```

### Code Quality Commands
```bash
# Lint
ruff check .

# Format
black .

# Type check
mypy src/

# Run all quality checks
ruff check . && black . && mypy src/ && pytest tests/
```

---

## Additional Resources

- **README.md**: General project overview and setup
- **DATABASE_SETUP.md**: Detailed database configuration
- **docs/EASYPANEL_DEPLOY.md**: Production deployment guide
- **specs/001-body-recomp-goals/**: Feature specifications and planning
- **API Docs**: http://localhost:8000/docs (when running)

---

**Last Updated**: 2025-11-22
**Maintainer**: Body Recomp Team
**Questions**: Check existing code patterns or ask for clarification
