"""
Measurements API router for Body Recomp Backend.
"""
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.deps import get_current_user
from src.models.user import User
from src.models.measurement import BodyMeasurement
from src.schemas.measurement import (
    BodyMeasurementCreate,
    BodyMeasurementResponse,
)
from src.services.body_fat_calculator import BodyFatCalculator

router = APIRouter(prefix="/measurements", tags=["Measurements"])


@router.post(
    "",
    response_model=BodyMeasurementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a body measurement",
    description=(
        "Log a new body measurement with method-specific measurements. "
        "The system calculates body fat percentage based on the provided "
        "calculation method."
    ),
)
async def create_measurement(
    measurement_data: BodyMeasurementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BodyMeasurement:
    """
    Create a new body measurement.
    
    Required measurements by method:
    - **Navy**: waist_cm, neck_cm, (hip_cm for women)
    - **3-Site**: chest/abdomen/thigh (men) OR tricep/suprailiac/thigh (women)
    - **7-Site**: All 7 skinfold measurements
    
    The body fat percentage is automatically calculated based on:
    - User's gender, age, height
    - Selected calculation method
    - Provided measurements
    
    Returns the created measurement with calculated body fat percentage.
    """
    # Calculate age from date of birth
    age = (datetime.utcnow() - current_user.date_of_birth).days // 365
    
    # Initialize calculator
    calculator = BodyFatCalculator()
    
    # Calculate body fat percentage based on method
    if measurement_data.calculation_method.value == "navy":
        body_fat = calculator.calculate_navy(
            gender=current_user.gender,
            height_cm=float(current_user.height_cm),
            waist_cm=float(measurement_data.waist_cm),
            neck_cm=float(measurement_data.neck_cm),
            hip_cm=(
                float(measurement_data.hip_cm)
                if measurement_data.hip_cm
                else None
            ),
        )
    elif measurement_data.calculation_method.value == "3_site":
        # Determine which skinfolds to use based on gender
        if current_user.gender.value == "male":
            if not all([
                measurement_data.chest_mm,
                measurement_data.abdomen_mm,
                measurement_data.thigh_mm,
            ]):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        "3-Site method for males requires: "
                        "chest_mm, abdomen_mm, thigh_mm"
                    ),
                )
            body_fat = calculator.calculate_3_site(
                gender=current_user.gender,
                age=age,
                chest_mm=float(measurement_data.chest_mm),
                abdomen_mm=float(measurement_data.abdomen_mm),
                thigh_mm=float(measurement_data.thigh_mm),
            )
        else:  # female
            if not all([
                measurement_data.tricep_mm,
                measurement_data.suprailiac_mm,
                measurement_data.thigh_mm,
            ]):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        "3-Site method for females requires: "
                        "tricep_mm, suprailiac_mm, thigh_mm"
                    ),
                )
            body_fat = calculator.calculate_3_site(
                gender=current_user.gender,
                age=age,
                tricep_mm=float(measurement_data.tricep_mm),
                suprailiac_mm=float(measurement_data.suprailiac_mm),
                thigh_mm=float(measurement_data.thigh_mm),
            )
    elif measurement_data.calculation_method.value == "7_site":
        body_fat = calculator.calculate_7_site(
            gender=current_user.gender,
            age=age,
            chest_mm=float(measurement_data.chest_mm),
            midaxillary_mm=float(measurement_data.midaxillary_mm),
            tricep_mm=float(measurement_data.tricep_mm),
            subscapular_mm=float(measurement_data.subscapular_mm),
            abdomen_mm=float(measurement_data.abdomen_mm),
            suprailiac_mm=float(measurement_data.suprailiac_mm),
            thigh_mm=float(measurement_data.thigh_mm),
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown calculation method: "
            f"{measurement_data.calculation_method}",
        )
    
    # Create measurement
    measurement = BodyMeasurement(
        user_id=current_user.id,
        weight_kg=measurement_data.weight_kg,
        calculation_method=measurement_data.calculation_method,
        waist_cm=measurement_data.waist_cm,
        neck_cm=measurement_data.neck_cm,
        hip_cm=measurement_data.hip_cm,
        chest_mm=measurement_data.chest_mm,
        abdomen_mm=measurement_data.abdomen_mm,
        thigh_mm=measurement_data.thigh_mm,
        tricep_mm=measurement_data.tricep_mm,
        suprailiac_mm=measurement_data.suprailiac_mm,
        midaxillary_mm=measurement_data.midaxillary_mm,
        subscapular_mm=measurement_data.subscapular_mm,
        calculated_body_fat_percentage=body_fat,
        notes=measurement_data.notes,
        measured_at=measurement_data.measured_at,
        created_at=datetime.utcnow(),
    )
    
    db.add(measurement)
    await db.commit()
    await db.refresh(measurement)
    
    return measurement
