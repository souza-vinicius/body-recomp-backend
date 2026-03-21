"""
BodyMeasurement SQLAlchemy model for Body Recomp Backend.
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.user import User

from sqlalchemy import (
    Enum as SQLEnum,
    DateTime,
    Numeric,
    CheckConstraint,
    ForeignKey,
    Text,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base
from src.models.enums import CalculationMethod


class BodyMeasurement(Base):
    """
    BodyMeasurement model representing a snapshot of user's body measurements.
    
    Stores weight, body composition measurements (circumferences or skinfolds),
    calculated body fat percentage, and measurement metadata.
    """

    __tablename__ = "body_measurements"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Foreign Key
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Core Measurements
    weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "weight_kg > 0 AND weight_kg >= 30 AND weight_kg <= 300"
        ),
        nullable=False,
    )

    calculation_method: Mapped[CalculationMethod] = mapped_column(
        SQLEnum(CalculationMethod, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )

    # Circumference Measurements (for Navy method)
    waist_cm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "waist_cm IS NULL OR (waist_cm >= 10 AND waist_cm <= 200)"
        ),
        nullable=True,
    )
    
    neck_cm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "neck_cm IS NULL OR (neck_cm >= 10 AND neck_cm <= 200)"
        ),
        nullable=True,
    )
    
    hip_cm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "hip_cm IS NULL OR (hip_cm >= 10 AND hip_cm <= 200)"
        ),
        nullable=True,
    )

    # Skinfold Measurements (for 3-Site and 7-Site methods)
    chest_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "chest_mm IS NULL OR (chest_mm >= 1 AND chest_mm <= 70)"
        ),
        nullable=True,
    )
    
    abdomen_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "abdomen_mm IS NULL OR (abdomen_mm >= 1 AND abdomen_mm <= 70)"
        ),
        nullable=True,
    )
    
    thigh_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "thigh_mm IS NULL OR (thigh_mm >= 1 AND thigh_mm <= 70)"
        ),
        nullable=True,
    )
    
    tricep_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "tricep_mm IS NULL OR (tricep_mm >= 1 AND tricep_mm <= 70)"
        ),
        nullable=True,
    )
    
    suprailiac_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "suprailiac_mm IS NULL OR "
            "(suprailiac_mm >= 1 AND suprailiac_mm <= 70)"
        ),
        nullable=True,
    )
    
    midaxillary_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "midaxillary_mm IS NULL OR "
            "(midaxillary_mm >= 1 AND midaxillary_mm <= 70)"
        ),
        nullable=True,
    )
    
    subscapular_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        CheckConstraint(
            "subscapular_mm IS NULL OR "
            "(subscapular_mm >= 1 AND subscapular_mm <= 70)"
        ),
        nullable=True,
    )

    # Calculated Results
    calculated_body_fat_percentage: Mapped[Decimal] = mapped_column(
        Numeric(4, 2),
        CheckConstraint(
            "calculated_body_fat_percentage >= 3 AND "
            "calculated_body_fat_percentage <= 50"
        ),
        nullable=False,
    )

    # Optional Metadata
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    measured_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="measurements",
    )

    # Composite Index for efficient queries by user and measurement date
    __table_args__ = (
        Index("ix_body_measurements_user_measured", "user_id", "measured_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<BodyMeasurement(id={self.id}, user_id={self.user_id}, "
            f"weight_kg={self.weight_kg}, "
            f"body_fat={self.calculated_body_fat_percentage}%)>"
        )
