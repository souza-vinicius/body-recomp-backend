"""
Measurements API router for Body Recomp Backend.
"""
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, select
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

router = APIRouter(prefix="/measurements", tags=["measurements"])


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
    # Calculate idade sem conflito de timezone (usar apenas datas)
    dob_date = current_user.date_of_birth.date()
    today_date = datetime.utcnow().date()
    age = (
        today_date.year
        - dob_date.year
        - ((today_date.month, today_date.day) < (dob_date.month, dob_date.day))
    )
    
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
    # Normalizar measured_at para naive UTC (TIMESTAMP WITHOUT TIME ZONE)
    measured_at = measurement_data.measured_at
    if (
        measured_at.tzinfo is not None
        and measured_at.tzinfo.utcoffset(measured_at) is not None
    ):
        measured_at = measured_at.astimezone(timezone.utc).replace(tzinfo=None)

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
        measured_at=measured_at,
        created_at=datetime.utcnow(),
    )
    
    db.add(measurement)
    await db.commit()
    await db.refresh(measurement)
    
    return measurement


@router.get(
    "",
    response_model=list[BodyMeasurementResponse],
    summary="List user measurements",
    description=(
        "Retrieve all body measurements for the authenticated user, "
        "ordered by measurement date (most recent first)."
    ),
)
async def list_measurements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[BodyMeasurement]:
    """
    List all measurements for the current user.
    
    Returns measurements ordered by measured_at descending (newest first).
    """
    query = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == current_user.id)
        .order_by(desc(BodyMeasurement.measured_at))
        .limit(limit)
        .offset(offset)
    )
    
    result = await db.execute(query)
    measurements = result.scalars().all()
    
    return list(measurements)


@router.get(
    "/latest",
    response_model=BodyMeasurementResponse,
    summary="Get latest measurement",
    description=(
        "Retrieve the most recent body measurement "
        "for the authenticated user."
    ),
)
async def get_latest_measurement(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BodyMeasurement:
    """
    Get the most recent measurement for the current user.
    
    Raises 404 if no measurements exist.
    """
    query = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == current_user.id)
        .order_by(desc(BodyMeasurement.measured_at))
        .limit(1)
    )
    
    result = await db.execute(query)
    measurement = result.scalar_one_or_none()
    
    if not measurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No measurements found for user",
        )
    
    return measurement


@router.get(
    "/stats",
    summary="Get measurement statistics",
    description=(
        "Calculate statistics from user measurements including "
        "current, minimum, maximum, and average values."
    ),
)
async def get_measurement_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get aggregate statistics for user measurements.
    
    Returns:
    - total_count: Total number of measurements
    - latest: Most recent measurement
    - weight_stats: Min, max, avg weight
    - body_fat_stats: Min, max, avg body fat percentage
    """
    # Get count
    count_query = select(func.count()).select_from(BodyMeasurement).where(
        BodyMeasurement.user_id == current_user.id
    )
    count_result = await db.execute(count_query)
    total_count = count_result.scalar_one()
    
    if total_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No measurements found for user",
        )
    
    # Get latest measurement
    latest_query = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == current_user.id)
        .order_by(desc(BodyMeasurement.measured_at))
        .limit(1)
    )
    latest_result = await db.execute(latest_query)
    latest = latest_result.scalar_one()
    
    # Get statistics
    stats_query = select(
        func.min(BodyMeasurement.weight_kg).label("min_weight"),
        func.max(BodyMeasurement.weight_kg).label("max_weight"),
        func.avg(BodyMeasurement.weight_kg).label("avg_weight"),
        func.min(BodyMeasurement.calculated_body_fat_percentage).label(
            "min_body_fat"
        ),
        func.max(BodyMeasurement.calculated_body_fat_percentage).label(
            "max_body_fat"
        ),
        func.avg(BodyMeasurement.calculated_body_fat_percentage).label(
            "avg_body_fat"
        ),
    ).where(BodyMeasurement.user_id == current_user.id)
    
    stats_result = await db.execute(stats_query)
    stats = stats_result.one()
    
    return {
        "total_count": total_count,
        "latest": {
            "id": str(latest.id),
            "weight_kg": float(latest.weight_kg),
            "body_fat_percentage": float(
                latest.calculated_body_fat_percentage
            ),
            "measured_at": latest.measured_at.isoformat(),
        },
        "weight_stats": {
            "min_kg": float(stats.min_weight),
            "max_kg": float(stats.max_weight),
            "avg_kg": float(stats.avg_weight),
        },
        "body_fat_stats": {
            "min_percentage": float(stats.min_body_fat),
            "max_percentage": float(stats.max_body_fat),
            "avg_percentage": float(stats.avg_body_fat),
        },
    }


@router.get(
    "/{measurement_id}",
    response_model=BodyMeasurementResponse,
    summary="Get specific measurement",
    description="Retrieve a specific body measurement by ID.",
)
async def get_measurement(
    measurement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BodyMeasurement:
    """
    Get a specific measurement by ID.
    
    Only returns measurements belonging to the authenticated user.
    """
    query = select(BodyMeasurement).where(
        BodyMeasurement.id == measurement_id,
        BodyMeasurement.user_id == current_user.id,
    )
    
    result = await db.execute(query)
    measurement = result.scalar_one_or_none()
    
    if not measurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement not found",
        )
    
    return measurement


@router.delete(
    "/{measurement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete measurement",
    description="Delete a specific body measurement.",
)
async def delete_measurement(
    measurement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a measurement by ID.
    
    Only allows deleting measurements belonging to the authenticated user.
    """
    query = select(BodyMeasurement).where(
        BodyMeasurement.id == measurement_id,
        BodyMeasurement.user_id == current_user.id,
    )
    
    result = await db.execute(query)
    measurement = result.scalar_one_or_none()
    
    if not measurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement not found",
        )
    
    await db.delete(measurement)
    await db.commit()
    
    return None
