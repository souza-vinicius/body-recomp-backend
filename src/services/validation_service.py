"""
Measurement validation service for Body Recomp Backend.
Validates measurements are within reasonable ranges for human physiology.
"""
from decimal import Decimal

from src.models.enums import Gender


class MeasurementValidator:
    """Service for validating body measurements."""

    # Body fat percentage ranges
    MIN_BODY_FAT_MALE = Decimal("5.0")
    MAX_BODY_FAT_MALE = Decimal("50.0")
    MIN_BODY_FAT_FEMALE = Decimal("8.0")
    MAX_BODY_FAT_FEMALE = Decimal("50.0")

    # Safe target limits
    SAFE_MIN_TARGET_MALE = Decimal("8.0")
    SAFE_MIN_TARGET_FEMALE = Decimal("15.0")

    # Weight ranges (kg)
    MIN_WEIGHT = Decimal("30.0")
    MAX_WEIGHT = Decimal("300.0")

    # Circumference ranges (cm)
    MIN_CIRCUMFERENCE = Decimal("10.0")
    MAX_CIRCUMFERENCE = Decimal("200.0")

    # Skinfold ranges (mm)
    MIN_SKINFOLD = Decimal("1.0")
    MAX_SKINFOLD = Decimal("60.0")

    @classmethod
    def validate_body_fat_range(
        cls,
        body_fat_percentage: Decimal,
        gender: Gender,
    ) -> tuple[bool, str | None]:
        """
        Validate body fat percentage is within physiological range.

        Args:
            body_fat_percentage: The body fat percentage to validate
            gender: User's gender

        Returns:
            Tuple of (is_valid, error_message)
        """
        if gender == Gender.MALE:
            min_bf = cls.MIN_BODY_FAT_MALE
            max_bf = cls.MAX_BODY_FAT_MALE
        else:
            min_bf = cls.MIN_BODY_FAT_FEMALE
            max_bf = cls.MAX_BODY_FAT_FEMALE

        if body_fat_percentage < min_bf:
            return False, f"Body fat percentage too low (minimum {min_bf}%)"
        elif body_fat_percentage > max_bf:
            return False, f"Body fat percentage too high (maximum {max_bf}%)"

        return True, None

    @classmethod
    def validate_target_safety(
        cls,
        target_body_fat: Decimal,
        gender: Gender,
    ) -> tuple[bool, str | None]:
        """
        Validate target body fat percentage is safe.

        Args:
            target_body_fat: The target body fat percentage
            gender: User's gender

        Returns:
            Tuple of (is_valid, error_message)
        """
        if gender == Gender.MALE:
            safe_min = cls.SAFE_MIN_TARGET_MALE
        else:
            safe_min = cls.SAFE_MIN_TARGET_FEMALE

        if target_body_fat < safe_min:
            return (
                False,
                f"Target body fat too low for safety. "
                f"Minimum recommended: {safe_min}%"
            )

        return True, None

    @classmethod
    def validate_weight(cls, weight_kg: Decimal) -> tuple[bool, str | None]:
        """
        Validate weight is within reasonable range.

        Args:
            weight_kg: Weight in kilograms

        Returns:
            Tuple of (is_valid, error_message)
        """
        if weight_kg < cls.MIN_WEIGHT:
            return False, f"Weight too low (minimum {cls.MIN_WEIGHT} kg)"
        elif weight_kg > cls.MAX_WEIGHT:
            return False, f"Weight too high (maximum {cls.MAX_WEIGHT} kg)"

        return True, None

    @classmethod
    def validate_circumference(
        cls,
        value: Decimal,
        measurement_name: str,
    ) -> tuple[bool, str | None]:
        """
        Validate circumference measurement is within reasonable range.

        Args:
            value: Circumference value in centimeters
            measurement_name: Name of the measurement for error message

        Returns:
            Tuple of (is_valid, error_message)
        """
        if value < cls.MIN_CIRCUMFERENCE:
            return (
                False,
                f"{measurement_name} too small (minimum {cls.MIN_CIRCUMFERENCE} cm)"
            )
        elif value > cls.MAX_CIRCUMFERENCE:
            return (
                False,
                f"{measurement_name} too large (maximum {cls.MAX_CIRCUMFERENCE} cm)"
            )

        return True, None

    @classmethod
    def validate_skinfold(
        cls,
        value: Decimal,
        measurement_name: str,
    ) -> tuple[bool, str | None]:
        """
        Validate skinfold measurement is within reasonable range.

        Args:
            value: Skinfold value in millimeters
            measurement_name: Name of the measurement for error message

        Returns:
            Tuple of (is_valid, error_message)
        """
        if value < cls.MIN_SKINFOLD:
            return (
                False,
                f"{measurement_name} too small (minimum {cls.MIN_SKINFOLD} mm)"
            )
        elif value > cls.MAX_SKINFOLD:
            return (
                False,
                f"{measurement_name} too large (maximum {cls.MAX_SKINFOLD} mm)"
            )

        return True, None

    @classmethod
    def validate_measurements(
        cls,
        weight_kg: Decimal,
        circumferences: dict[str, Decimal | None],
        skinfolds: dict[str, Decimal | None],
    ) -> list[str]:
        """
        Validate all measurements and return list of errors.

        Args:
            weight_kg: Weight in kilograms
            circumferences: Dictionary of circumference measurements
            skinfolds: Dictionary of skinfold measurements

        Returns:
            List of validation error messages (empty if all valid)
        """
        errors = []

        # Validate weight
        is_valid, error = cls.validate_weight(weight_kg)
        if not is_valid and error:
            errors.append(error)

        # Validate circumferences
        for name, value in circumferences.items():
            if value is not None:
                is_valid, error = cls.validate_circumference(value, name)
                if not is_valid and error:
                    errors.append(error)

        # Validate skinfolds
        for name, value in skinfolds.items():
            if value is not None:
                is_valid, error = cls.validate_skinfold(value, name)
                if not is_valid and error:
                    errors.append(error)

        return errors
