"""
Measurements API router for Body Recomp Backend.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.deps import get_current_user
from src.models.user import User
from src.models.measurement import BodyMeasurement
from src.schemas.measurement import (
    BodyMeasurementCreate,
    BodyMeasurementUpdate,
    BodyMeasurementResponse,
)
from src.services.body_fat_calculator import BodyFatCalculator
from src.services.validation_service import MeasurementValidator

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

    is_valid_body_fat, body_fat_error = (
        MeasurementValidator.validate_body_fat_range(
            body_fat_percentage=body_fat,
            gender=current_user.gender,
        )
    )
    if not is_valid_body_fat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=body_fat_error,
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


@router.patch(
    "/{measurement_id}",
    response_model=BodyMeasurementResponse,
    summary="Update a body measurement",
    description=(
        "Update an existing body measurement. Recalculates body fat "
        "percentage and cascades changes to linked progress entries."
    ),
)
async def update_measurement(
    measurement_id: str,
    update_data: BodyMeasurementUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BodyMeasurement:
    """
    Update an existing body measurement.

    Updates measurement fields and recalculates body fat %.
    If this measurement is linked to a progress entry, the progress
    entry's derived fields are also updated.
    """
    from uuid import UUID as PyUUID
    from sqlalchemy import select
    from src.models.progress import ProgressEntry
    from src.models.goal import Goal
    from sqlalchemy.orm import selectinload

    mid = PyUUID(measurement_id)

    # Fetch measurement
    result = await db.execute(
        select(BodyMeasurement).where(BodyMeasurement.id == mid)
    )
    measurement = result.scalar_one_or_none()

    if not measurement or measurement.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement not found",
        )

    # Apply field updates
    fields = update_data.model_dump(exclude_unset=True)
    for field, value in fields.items():
        setattr(measurement, field, value)

    # Recalculate body fat with updated values
    age = (datetime.utcnow() - current_user.date_of_birth).days // 365
    calculator = BodyFatCalculator()
    method = measurement.calculation_method.value

    try:
        if method == "navy":
            body_fat = calculator.calculate_navy(
                gender=current_user.gender,
                height_cm=float(current_user.height_cm),
                waist_cm=float(measurement.waist_cm),
                neck_cm=float(measurement.neck_cm),
                hip_cm=float(measurement.hip_cm) if measurement.hip_cm else None,
            )
        elif method == "3_site":
            if current_user.gender.value == "male":
                body_fat = calculator.calculate_3_site(
                    gender=current_user.gender,
                    age=age,
                    chest_mm=float(measurement.chest_mm),
                    abdomen_mm=float(measurement.abdomen_mm),
                    thigh_mm=float(measurement.thigh_mm),
                )
            else:
                body_fat = calculator.calculate_3_site(
                    gender=current_user.gender,
                    age=age,
                    tricep_mm=float(measurement.tricep_mm),
                    suprailiac_mm=float(measurement.suprailiac_mm),
                    thigh_mm=float(measurement.thigh_mm),
                )
        elif method == "7_site":
            body_fat = calculator.calculate_7_site(
                gender=current_user.gender,
                age=age,
                chest_mm=float(measurement.chest_mm),
                midaxillary_mm=float(measurement.midaxillary_mm),
                tricep_mm=float(measurement.tricep_mm),
                subscapular_mm=float(measurement.subscapular_mm),
                abdomen_mm=float(measurement.abdomen_mm),
                suprailiac_mm=float(measurement.suprailiac_mm),
                thigh_mm=float(measurement.thigh_mm),
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown calculation method: {method}",
            )
    except (TypeError, AttributeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required fields for {method} method: {e}",
        )

    is_valid, error_msg = MeasurementValidator.validate_body_fat_range(
        body_fat_percentage=body_fat,
        gender=current_user.gender,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    measurement.calculated_body_fat_percentage = body_fat

    # Cascade to linked progress entry
    entry_result = await db.execute(
        select(ProgressEntry).where(ProgressEntry.measurement_id == mid)
    )
    progress_entry = entry_result.scalar_one_or_none()

    if progress_entry:
        progress_entry.body_fat_percentage = measurement.calculated_body_fat_percentage
        progress_entry.weight_kg = measurement.weight_kg

        # Recalculate deltas against previous entry or initial measurement
        goal_result = await db.execute(
            select(Goal)
            .options(
                selectinload(Goal.initial_measurement),
                selectinload(Goal.progress_entries),
            )
            .where(Goal.id == progress_entry.goal_id)
        )
        goal = goal_result.scalar_one_or_none()

        if goal:
            sorted_entries = sorted(goal.progress_entries, key=lambda e: e.week_number)
            entry_idx = next(
                (i for i, e in enumerate(sorted_entries) if e.id == progress_entry.id),
                None,
            )

            if entry_idx is not None:
                if entry_idx == 0:
                    # Compare against initial measurement
                    prev_bf = goal.initial_measurement.calculated_body_fat_percentage
                    prev_weight = goal.initial_measurement.weight_kg
                else:
                    prev_entry = sorted_entries[entry_idx - 1]
                    prev_bf = prev_entry.body_fat_percentage
                    prev_weight = prev_entry.weight_kg

                progress_entry.body_fat_change = (
                    measurement.calculated_body_fat_percentage - prev_bf
                )
                progress_entry.weight_change_kg = (
                    measurement.weight_kg - prev_weight
                )

    await db.commit()
    await db.refresh(measurement)

    return measurement
