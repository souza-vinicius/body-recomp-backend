"""
Body fat calculator service implementing multiple calculation methods.
Formulas based on research.md specifications.
"""
import math
from decimal import Decimal

from src.models.enums import Gender, CalculationMethod


class BodyFatCalculator:
    """Service for calculating body fat percentage using various methods."""

    @staticmethod
    def calculate_navy(
        gender: Gender,
        height_cm: Decimal,
        waist_cm: Decimal,
        neck_cm: Decimal,
        hip_cm: Decimal | None = None,
    ) -> Decimal:
        """
        Calculate body fat percentage using US Navy method.

        Formula for men: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
        Formula for women: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387

        Args:
            gender: User's gender
            height_cm: Height in centimeters
            waist_cm: Waist circumference in centimeters
            neck_cm: Neck circumference in centimeters
            hip_cm: Hip circumference in centimeters (required for women)

        Returns:
            Body fat percentage as Decimal

        Raises:
            ValueError: If required measurements are missing or invalid
        """
        if gender == Gender.MALE:
            # Men: BF% = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
            body_fat = (
                86.010 * math.log10(float(waist_cm - neck_cm))
                - 70.041 * math.log10(float(height_cm))
                + 36.76
            )
        else:  # Female
            if hip_cm is None:
                raise ValueError("Hip measurement required for women using Navy method")
            # Women: BF% = 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
            body_fat = (
                163.205 * math.log10(float(waist_cm + hip_cm - neck_cm))
                - 97.684 * math.log10(float(height_cm))
                - 78.387
            )

        return Decimal(str(round(body_fat, 2)))

    @staticmethod
    def calculate_3_site(
        gender: Gender,
        age: int,
        chest_mm: Decimal | None = None,
        abdomen_mm: Decimal | None = None,
        thigh_mm: Decimal | None = None,
        tricep_mm: Decimal | None = None,
        suprailiac_mm: Decimal | None = None,
    ) -> Decimal:
        """
        Calculate body fat percentage using 3-Site Skinfold method.

        Men: chest, abdomen, thigh
        Women: tricep, suprailiac, thigh

        Uses Jackson-Pollock formula:
        1. Calculate body density
        2. Convert to body fat % using Siri equation: (495 / density) - 450

        Args:
            gender: User's gender
            age: User's age in years
            chest_mm: Chest skinfold in mm (men)
            abdomen_mm: Abdomen skinfold in mm (men)
            thigh_mm: Thigh skinfold in mm (both)
            tricep_mm: Tricep skinfold in mm (women)
            suprailiac_mm: Suprailiac skinfold in mm (women)

        Returns:
            Body fat percentage as Decimal

        Raises:
            ValueError: If required measurements are missing
        """
        if gender == Gender.MALE:
            if chest_mm is None or abdomen_mm is None or thigh_mm is None:
                raise ValueError("Chest, abdomen, and thigh measurements required for men")
            sum_skinfolds = float(chest_mm + abdomen_mm + thigh_mm)
            # Men: density = 1.10938 - 0.0008267(sum) + 0.0000016(sum^2) - 0.0002574(age)
            density = (
                1.10938
                - 0.0008267 * sum_skinfolds
                + 0.0000016 * (sum_skinfolds ** 2)
                - 0.0002574 * age
            )
        else:  # Female
            if tricep_mm is None or suprailiac_mm is None or thigh_mm is None:
                raise ValueError("Tricep, suprailiac, and thigh measurements required for women")
            sum_skinfolds = float(tricep_mm + suprailiac_mm + thigh_mm)
            # Women: density = 1.0994921 - 0.0009929(sum) + 0.0000023(sum^2) - 0.0001392(age)
            density = (
                1.0994921
                - 0.0009929 * sum_skinfolds
                + 0.0000023 * (sum_skinfolds ** 2)
                - 0.0001392 * age
            )

        # Siri equation: BF% = (495 / density) - 450
        body_fat = (495 / density) - 450
        return Decimal(str(round(body_fat, 2)))

    @staticmethod
    def calculate_7_site(
        gender: Gender,
        age: int,
        chest_mm: Decimal,
        midaxillary_mm: Decimal,
        tricep_mm: Decimal,
        subscapular_mm: Decimal,
        abdomen_mm: Decimal,
        suprailiac_mm: Decimal,
        thigh_mm: Decimal,
    ) -> Decimal:
        """
        Calculate body fat percentage using 7-Site Skinfold method.

        Uses Jackson-Pollock 7-site formula for both men and women.

        Args:
            gender: User's gender
            age: User's age in years
            chest_mm: Chest skinfold in mm
            midaxillary_mm: Midaxillary skinfold in mm
            tricep_mm: Tricep skinfold in mm
            subscapular_mm: Subscapular skinfold in mm
            abdomen_mm: Abdomen skinfold in mm
            suprailiac_mm: Suprailiac skinfold in mm
            thigh_mm: Thigh skinfold in mm

        Returns:
            Body fat percentage as Decimal
        """
        sum_skinfolds = float(
            chest_mm + midaxillary_mm + tricep_mm + subscapular_mm
            + abdomen_mm + suprailiac_mm + thigh_mm
        )

        if gender == Gender.MALE:
            # Men: density = 1.112 - 0.00043499(sum) + 0.00000055(sum^2) - 0.00028826(age)
            density = (
                1.112
                - 0.00043499 * sum_skinfolds
                + 0.00000055 * (sum_skinfolds ** 2)
                - 0.00028826 * age
            )
        else:  # Female
            # Women: density = 1.097 - 0.00046971(sum) + 0.00000056(sum^2) - 0.00012828(age)
            density = (
                1.097
                - 0.00046971 * sum_skinfolds
                + 0.00000056 * (sum_skinfolds ** 2)
                - 0.00012828 * age
            )

        # Siri equation: BF% = (495 / density) - 450
        body_fat = (495 / density) - 450
        return Decimal(str(round(body_fat, 2)))

    @classmethod
    def calculate(
        cls,
        method: CalculationMethod,
        gender: Gender,
        age: int,
        height_cm: Decimal,
        **measurements: Decimal | None,
    ) -> Decimal:
        """
        Calculate body fat percentage using the specified method.

        Args:
            method: Calculation method to use
            gender: User's gender
            age: User's age in years
            height_cm: Height in centimeters
            **measurements: Measurement values specific to the method

        Returns:
            Body fat percentage as Decimal

        Raises:
            ValueError: If method is invalid or required measurements are missing
        """
        if method == CalculationMethod.NAVY:
            return cls.calculate_navy(
                gender=gender,
                height_cm=height_cm,
                waist_cm=measurements.get("waist_cm"),
                neck_cm=measurements.get("neck_cm"),
                hip_cm=measurements.get("hip_cm"),
            )
        elif method == CalculationMethod.THREE_SITE:
            return cls.calculate_3_site(
                gender=gender,
                age=age,
                chest_mm=measurements.get("chest_mm"),
                abdomen_mm=measurements.get("abdomen_mm"),
                thigh_mm=measurements.get("thigh_mm"),
                tricep_mm=measurements.get("tricep_mm"),
                suprailiac_mm=measurements.get("suprailiac_mm"),
            )
        elif method == CalculationMethod.SEVEN_SITE:
            return cls.calculate_7_site(
                gender=gender,
                age=age,
                chest_mm=measurements["chest_mm"],
                midaxillary_mm=measurements["midaxillary_mm"],
                tricep_mm=measurements["tricep_mm"],
                subscapular_mm=measurements["subscapular_mm"],
                abdomen_mm=measurements["abdomen_mm"],
                suprailiac_mm=measurements["suprailiac_mm"],
                thigh_mm=measurements["thigh_mm"],
            )
        else:
            raise ValueError(f"Invalid calculation method: {method}")
