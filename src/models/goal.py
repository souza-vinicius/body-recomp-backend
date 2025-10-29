"""
Goal SQLAlchemy model for Body Recomp Backend.
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    Enum as SQLEnum,
    DateTime,
    Numeric,
    CheckConstraint,
    ForeignKey,
    Integer,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base
from src.models.enums import GoalType, GoalStatus

if TYPE_CHECKING:
    from src.models.user import User
    from src.models.measurement import BodyMeasurement
    from src.models.plan import TrainingPlan, DietPlan
    from src.models.progress import ProgressEntry


class Goal(Base):
    """
    Goal model representing a user's body recomposition goal.
    
    Tracks cutting (fat loss) or bulking (muscle gain) goals with
    caloric targets, body fat targets, and progress tracking.
    """

    __tablename__ = "goals"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Foreign Keys
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    initial_measurement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("body_measurements.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Goal Configuration
    goal_type: Mapped[GoalType] = mapped_column(
        SQLEnum(GoalType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )

    status: Mapped[GoalStatus] = mapped_column(
        SQLEnum(GoalStatus, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=GoalStatus.ACTIVE,
        server_default="active",
    )

    # Initial State
    initial_body_fat_percentage: Mapped[Decimal] = mapped_column(
        Numeric(4, 2),
        CheckConstraint(
            "initial_body_fat_percentage >= 3 AND "
            "initial_body_fat_percentage <= 50"
        ),
        nullable=False,
    )

    initial_weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "initial_weight_kg > 0 AND "
            "initial_weight_kg >= 30 AND initial_weight_kg <= 300"
        ),
        nullable=False,
    )

    # Target Configuration (one of these must be set)
    target_body_fat_percentage: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(4, 2),
        CheckConstraint(
            "target_body_fat_percentage IS NULL OR "
            "(target_body_fat_percentage >= 3 AND "
            "target_body_fat_percentage <= 50)"
        ),
        nullable=True,
    )

    ceiling_body_fat_percentage: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(4, 2),
        CheckConstraint(
            "ceiling_body_fat_percentage IS NULL OR "
            "(ceiling_body_fat_percentage >= 3 AND "
            "ceiling_body_fat_percentage <= 50)"
        ),
        nullable=True,
    )

    # Caloric Targets
    target_calories: Mapped[int] = mapped_column(
        Integer,
        CheckConstraint(
            "target_calories > 0 AND "
            "target_calories >= 1200 AND target_calories <= 5000"
        ),
        nullable=False,
    )

    # Estimation
    estimated_weeks_to_goal: Mapped[Optional[int]] = mapped_column(
        Integer,
        CheckConstraint(
            "estimated_weeks_to_goal IS NULL OR estimated_weeks_to_goal > 0"
        ),
        nullable=True,
    )

    # Timestamps
    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="goals",
    )

    initial_measurement: Mapped["BodyMeasurement"] = relationship(
        "BodyMeasurement",
        foreign_keys=[initial_measurement_id],
    )

    progress_entries: Mapped[list["ProgressEntry"]] = relationship(
        "ProgressEntry",
        back_populates="goal",
        foreign_keys="[ProgressEntry.goal_id]",
        cascade="all, delete-orphan",
        order_by="ProgressEntry.week_number",
    )

    training_plan: Mapped[Optional["TrainingPlan"]] = relationship(
        "TrainingPlan",
        back_populates="goal",
        uselist=False,
        cascade="all, delete-orphan",
    )

    diet_plan: Mapped[Optional["DietPlan"]] = relationship(
        "DietPlan",
        back_populates="goal",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Composite Indexes
    __table_args__ = (
        Index("ix_goals_user_status", "user_id", "status"),
        Index("ix_goals_user_started", "user_id", "started_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<Goal(id={self.id}, user_id={self.user_id}, "
            f"type={self.goal_type.value}, status={self.status.value})>"
        )

    @property
    def current_body_fat_percentage(self) -> float:
        """
        Get current body fat percentage.
        
        For new goals without progress, returns initial BF%.
        """
        # TODO: When progress tracking is implemented, get latest from progress
        return float(self.initial_body_fat_percentage)

    @property
    def progress_percentage(self) -> float:
        """
        Calculate progress toward goal as percentage.
        
        For cutting: (initial - current) / (initial - target) * 100
        For bulking: (current - initial) / (ceiling - initial) * 100
        """
        current = self.current_body_fat_percentage
        initial = float(self.initial_body_fat_percentage)
        
        if self.goal_type == GoalType.CUTTING:
            if self.target_body_fat_percentage is None:
                return 0.0
            target = float(self.target_body_fat_percentage)
            if initial == target:
                return 100.0
            progress = (initial - current) / (initial - target) * 100
        else:  # BULKING
            if self.ceiling_body_fat_percentage is None:
                return 0.0
            ceiling = float(self.ceiling_body_fat_percentage)
            if initial == ceiling:
                return 100.0
            progress = (current - initial) / (ceiling - initial) * 100
        
        return max(0.0, min(100.0, progress))

    @property
    def weeks_elapsed(self) -> int:
        """
        Calculate weeks since goal started.
        """
        from datetime import datetime
        
        now = datetime.utcnow()
        delta = now - self.started_at
        return delta.days // 7

    @property
    def is_on_track(self) -> bool:
        """
        Determine if progress is on track with estimate.
        
        For goals without progress yet, returns True.
        """
        if self.estimated_weeks_to_goal is None:
            return True
        
        weeks = self.weeks_elapsed
        if weeks == 0:
            return True
        
        expected_progress = (weeks / self.estimated_weeks_to_goal) * 100
        actual_progress = self.progress_percentage
        
        # Allow 10% variance
        return actual_progress >= (expected_progress * 0.9)
