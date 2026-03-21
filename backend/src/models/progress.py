"""ProgressEntry model for weekly progress tracking.

Tracks weekly measurements against goals to monitor progress over time.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class ProgressEntry(Base):
    """Weekly measurement log tracking progress toward a goal.
    
    Attributes:
        id: Unique identifier
        goal_id: Associated goal being tracked
        measurement_id: Weekly body measurement
        week_number: Week # since goal start (1, 2, 3, ...)
        body_fat_percentage: Body fat % at this checkpoint
        weight_kg: Weight at this checkpoint
        body_fat_change: Change from previous week (negative = loss)
        weight_change_kg: Weight change from previous week (negative = loss)
        is_on_track: Whether progress meets expected rate
        notes: User or system notes about this week's progress
        logged_at: Timestamp when progress was logged
    """

    __tablename__ = "progress_entries"

    # Primary key
    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
        doc="Unique identifier for the progress entry"
    )

    # Foreign keys
    goal_id: Mapped[UUID] = mapped_column(
        ForeignKey("goals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Goal this progress entry belongs to"
    )
    measurement_id: Mapped[UUID] = mapped_column(
        ForeignKey("body_measurements.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
        doc="Body measurement taken at this checkpoint"
    )

    # Progress tracking fields
    week_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        doc="Week number since goal start (1, 2, 3, ...)"
    )
    body_fat_percentage: Mapped[Decimal] = mapped_column(
        Numeric(4, 2),
        nullable=False,
        doc="Body fat percentage at this checkpoint"
    )
    weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        doc="Weight in kilograms at this checkpoint"
    )
    body_fat_change: Mapped[Decimal] = mapped_column(
        Numeric(4, 2),
        nullable=False,
        doc="Change in body fat % from previous entry (negative = loss)"
    )
    weight_change_kg: Mapped[Decimal] = mapped_column(
        Numeric(4, 2),
        nullable=False,
        doc="Change in weight from previous entry (negative = loss)"
    )

    # Status and feedback
    is_on_track: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        doc="Whether progress meets expected rate based on goal timeline"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="User notes or system feedback about this week's progress"
    )

    # Timestamps
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        doc="When this progress entry was logged"
    )

    # Relationships
    goal: Mapped["Goal"] = relationship(
        "Goal",
        back_populates="progress_entries",
        foreign_keys=[goal_id]
    )
    measurement: Mapped["BodyMeasurement"] = relationship(
        "BodyMeasurement",
        foreign_keys=[measurement_id]
    )

    # Constraints
    __table_args__ = (
        CheckConstraint("week_number > 0", name="positive_week_number"),
        CheckConstraint(
            "body_fat_percentage >= 3.0 AND body_fat_percentage <= 60.0",
            name="reasonable_body_fat_range"
        ),
        CheckConstraint(
            "weight_kg >= 30.0 AND weight_kg <= 300.0",
            name="reasonable_weight_range"
        ),
        {"comment": "Weekly progress entries tracking goal progress over time"}
    )

    def __repr__(self) -> str:
        """String representation of progress entry."""
        return (
            f"<ProgressEntry(id={self.id}, goal_id={self.goal_id}, "
            f"week_number={self.week_number}, bf={self.body_fat_percentage}%)>"
        )
