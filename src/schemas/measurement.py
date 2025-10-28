"""
BodyMeasurement Pydantic schemas for Body Recomp Backend.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import (
    BaseModel,
    Field,
    model_validator,
)

from src.models.enums import CalculationMethod


class BodyMeasurementCreate(BaseModel):
    """
    Schema for creating a new body measurement.
    
    Validates that required fields are provided based on calculation_method.
    """

    weight_kg: Decimal = Field(
        ...,
        ge=30.0,
        le=300.0,
        description="Weight in kilograms",
    )
    calculation_method: CalculationMethod = Field(
        ...,
        description="Method used for body fat calculation",
    )
    
    # Circumference measurements (Navy method)
    waist_cm: Optional[Decimal] = Field(
        None,
        ge=10.0,
        le=200.0,
        description="Waist circumference in cm",
    )
    neck_cm: Optional[Decimal] = Field(
        None,
        ge=10.0,
        le=200.0,
        description="Neck circumference in cm",
    )
    hip_cm: Optional[Decimal] = Field(
        None,
        ge=10.0,
        le=200.0,
        description="Hip circumference in cm (required for Navy - women)",
    )
    
    # Skinfold measurements (3-Site and 7-Site methods)
    chest_mm: Optional[Decimal] = Field(
        None,
        ge=1.0,
        le=70.0,
        description="Chest skinfold in mm",
    )
    abdomen_mm: Optional[Decimal] = Field(
        None,
        ge=1.0,
        le=70.0,
        description="Abdomen skinfold in mm",
    )
    thigh_mm: Optional[Decimal] = Field(
        None,
        ge=1.0,
        le=70.0,
        description="Thigh skinfold in mm",
    )
    tricep_mm: Optional[Decimal] = Field(
        None,
        ge=1.0,
        le=70.0,
        description="Tricep skinfold in mm",
    )
    suprailiac_mm: Optional[Decimal] = Field(
        None,
        ge=1.0,
        le=70.0,
        description="Suprailiac skinfold in mm",
    )
    midaxillary_mm: Optional[Decimal] = Field(
        None,
        ge=1.0,
        le=70.0,
        description="Midaxillary skinfold in mm",
    )
    subscapular_mm: Optional[Decimal] = Field(
        None,
        ge=1.0,
        le=70.0,
        description="Subscapular skinfold in mm",
    )
    
    notes: Optional[str] = Field(
        None,
        description="Optional notes about the measurement",
    )
    measured_at: datetime = Field(
        ...,
        description="When the measurement was taken",
    )

    @model_validator(mode="after")
    def validate_required_fields_by_method(self) -> "BodyMeasurementCreate":
        """
        Validate required fields based on calculation method and gender.
        
        Implements FR-006-B: Only require fields for selected method.
        """
        method = self.calculation_method
        
        if method == CalculationMethod.NAVY:
            # Navy requires waist and neck
            if not self.waist_cm:
                raise ValueError("waist_cm is required for Navy method")
            if not self.neck_cm:
                raise ValueError("neck_cm is required for Navy method")
            # Hip is required for women, but we don't have gender
            # in this schema. Validation done in service layer.
        
        elif method == CalculationMethod.THREE_SITE:
            # 3-Site requires chest/abdomen/thigh (men)
            # or tricep/suprailiac/thigh (women)
            # We check for at least one valid combination
            male_combo = (
                self.chest_mm is not None
                and self.abdomen_mm is not None
                and self.thigh_mm is not None
            )
            female_combo = (
                self.tricep_mm is not None
                and self.suprailiac_mm is not None
                and self.thigh_mm is not None
            )
            
            if not (male_combo or female_combo):
                raise ValueError(
                    "3-Site method requires either "
                    "(chest_mm, abdomen_mm, thigh_mm) for males or "
                    "(tricep_mm, suprailiac_mm, thigh_mm) for females"
                )
        
        elif method == CalculationMethod.SEVEN_SITE:
            # 7-Site requires all seven skinfold measurements
            required_fields = [
                ("chest_mm", self.chest_mm),
                ("midaxillary_mm", self.midaxillary_mm),
                ("tricep_mm", self.tricep_mm),
                ("subscapular_mm", self.subscapular_mm),
                ("abdomen_mm", self.abdomen_mm),
                ("suprailiac_mm", self.suprailiac_mm),
                ("thigh_mm", self.thigh_mm),
            ]
            
            missing = [
                name for name, value in required_fields if value is None
            ]
            
            if missing:
                raise ValueError(
                    f"7-Site method requires all skinfold measurements. "
                    f"Missing: {', '.join(missing)}"
                )
        
        return self


class BodyMeasurementResponse(BaseModel):
    """Schema for returning a body measurement."""

    id: UUID
    user_id: UUID
    weight_kg: float
    calculation_method: CalculationMethod
    waist_cm: Optional[float] = None
    neck_cm: Optional[float] = None
    hip_cm: Optional[float] = None
    chest_mm: Optional[float] = None
    abdomen_mm: Optional[float] = None
    thigh_mm: Optional[float] = None
    tricep_mm: Optional[float] = None
    suprailiac_mm: Optional[float] = None
    midaxillary_mm: Optional[float] = None
    subscapular_mm: Optional[float] = None
    calculated_body_fat_percentage: float = Field(
        ...,
        description="Calculated body fat percentage",
    )
    notes: Optional[str] = None
    measured_at: datetime
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }
