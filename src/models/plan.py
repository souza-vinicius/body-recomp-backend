"""Training and Diet Plan SQLAlchemy models."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from src.core.database import Base


class TrainingPlan(Base):
    """Training plan recommendations for a goal.

    Attributes:
        id: Unique identifier
        goal_id: Associated goal (one-to-one)
        plan_details: JSONB structured training recommendations
        workout_frequency: Sessions per week
        primary_focus: e.g., "Strength training + cardio for fat loss"
        notes: Additional guidance
        created_at: Plan generation date
        updated_at: Last modification
    """

    __tablename__ = "training_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    goal_id = Column(
        UUID(as_uuid=True),
        ForeignKey("goals.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    plan_details = Column(JSONB, nullable=False)
    workout_frequency = Column(
        Integer,
        nullable=False,
        info={"description": "Sessions per week"},
    )
    primary_focus = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    goal = relationship("Goal", back_populates="training_plan")

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "workout_frequency > 0 AND workout_frequency <= 7",
            name="valid_workout_frequency",
        ),
    )

    def __repr__(self) -> str:
        """String representation."""
        return (
            f"<TrainingPlan(id={self.id}, "
            f"goal_id={self.goal_id}, "
            f"frequency={self.workout_frequency})>"
        )


class DietPlan(Base):
    """Nutritional guidelines for a goal.

    Attributes:
        id: Unique identifier
        goal_id: Associated goal (one-to-one)
        daily_calorie_target: Total daily calories
        protein_grams: Daily protein target
        carbs_grams: Daily carbs target
        fat_grams: Daily fat target
        meal_timing: JSONB optional meal schedule
        guidelines: Nutritional advice text
        created_at: Plan generation date
        updated_at: Last modification
    """

    __tablename__ = "diet_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    goal_id = Column(
        UUID(as_uuid=True),
        ForeignKey("goals.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    daily_calorie_target = Column(
        Integer,
        nullable=False,
        info={"description": "Total daily calories"},
    )
    protein_grams = Column(
        Integer,
        nullable=False,
        info={"description": "Daily protein target"},
    )
    carbs_grams = Column(
        Integer,
        nullable=False,
        info={"description": "Daily carbs target"},
    )
    fat_grams = Column(
        Integer,
        nullable=False,
        info={"description": "Daily fat target"},
    )
    meal_timing = Column(JSONB, nullable=True)
    guidelines = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    goal = relationship("Goal", back_populates="diet_plan")

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "daily_calorie_target >= 1200 AND daily_calorie_target <= 5000",
            name="valid_calorie_target",
        ),
        CheckConstraint(
            "protein_grams >= 50 AND protein_grams <= 400",
            name="valid_protein",
        ),
        CheckConstraint(
            "carbs_grams >= 50 AND carbs_grams <= 800",
            name="valid_carbs",
        ),
        CheckConstraint(
            "fat_grams >= 20 AND fat_grams <= 200",
            name="valid_fat",
        ),
    )

    def __repr__(self) -> str:
        """String representation."""
        return (
            f"<DietPlan(id={self.id}, "
            f"goal_id={self.goal_id}, "
            f"calories={self.daily_calorie_target})>"
        )
