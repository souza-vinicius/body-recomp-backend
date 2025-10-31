"""
User SQLAlchemy model for Body Recomp Backend.
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    String,
    Enum as SQLEnum,
    DateTime,
    Numeric,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base
from src.models.enums import Gender, CalculationMethod, ActivityLevel

if TYPE_CHECKING:
    from src.models.measurement import BodyMeasurement
    from src.models.goal import Goal


class User(Base):
    """User model representing a registered user in the system."""

    __tablename__ = "users"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Authentication
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Personal Information
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    gender: Mapped[Gender] = mapped_column(
        SQLEnum(Gender, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )

    # Physical Attributes
    height_cm: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        CheckConstraint("height_cm >= 120 AND height_cm <= 250"),
        nullable=False,
    )

    # Preferences
    preferred_calculation_method: Mapped[CalculationMethod] = mapped_column(
        SQLEnum(CalculationMethod, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    activity_level: Mapped[ActivityLevel] = mapped_column(
        SQLEnum(ActivityLevel, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    goals: Mapped[list["Goal"]] = relationship(
        "Goal",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    
    measurements: Mapped[list["BodyMeasurement"]] = relationship(
        "BodyMeasurement",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
