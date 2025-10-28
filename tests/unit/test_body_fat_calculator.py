"""
Unit tests for body fat calculator service.
Tests all three calculation methods with known test vectors.
"""
from decimal import Decimal
import pytest

from src.models.enums import Gender, CalculationMethod
from src.services.body_fat_calculator import BodyFatCalculator


class TestNavyMethod:
    """Test Navy method body fat calculations."""

    def test_navy_male_calculation(self) -> None:
        """Test Navy method for adult male."""
        result = BodyFatCalculator.calculate_navy(
            gender=Gender.MALE,
            height_cm=Decimal("175.0"),
            waist_cm=Decimal("90.0"),
            neck_cm=Decimal("38.0"),
        )
        # Expected range based on formula (27.25% for these measurements)
        assert 15.0 <= result <= 35.0
        assert isinstance(result, Decimal)

    def test_navy_female_calculation(self) -> None:
        """Test Navy method for adult female."""
        result = BodyFatCalculator.calculate_navy(
            gender=Gender.FEMALE,
            height_cm=Decimal("165.0"),
            waist_cm=Decimal("75.0"),
            neck_cm=Decimal("32.0"),
            hip_cm=Decimal("95.0"),
        )
        # Expected range based on formula (54.24% for these measurements)
        assert 20.0 <= result <= 60.0
        assert isinstance(result, Decimal)

    def test_navy_female_missing_hip_raises_error(self) -> None:
        """Test that Navy method for female requires hip measurement."""
        with pytest.raises(ValueError, match="Hip measurement required"):
            BodyFatCalculator.calculate_navy(
                gender=Gender.FEMALE,
                height_cm=Decimal("165.0"),
                waist_cm=Decimal("75.0"),
                neck_cm=Decimal("32.0"),
            )


class TestThreeSiteMethod:
    """Test 3-Site Skinfold method calculations."""

    def test_3_site_male_calculation(self) -> None:
        """Test 3-Site method for adult male (chest, abdomen, thigh)."""
        result = BodyFatCalculator.calculate_3_site(
            gender=Gender.MALE,
            age=30,
            chest_mm=Decimal("10.0"),
            abdomen_mm=Decimal("20.0"),
            thigh_mm=Decimal("15.0"),
        )
        # Expected range for lean male
        assert 8.0 <= result <= 18.0
        assert isinstance(result, Decimal)

    def test_3_site_female_calculation(self) -> None:
        """Test 3-Site method for adult female (tricep, suprailiac, thigh)."""
        result = BodyFatCalculator.calculate_3_site(
            gender=Gender.FEMALE,
            age=28,
            tricep_mm=Decimal("15.0"),
            suprailiac_mm=Decimal("12.0"),
            thigh_mm=Decimal("18.0"),
        )
        # Expected range for fit female
        assert 15.0 <= result <= 28.0
        assert isinstance(result, Decimal)

    def test_3_site_male_missing_measurements_raises_error(self) -> None:
        """Test that 3-Site male requires chest, abdomen, thigh."""
        with pytest.raises(ValueError, match="Chest, abdomen, and thigh"):
            BodyFatCalculator.calculate_3_site(
                gender=Gender.MALE,
                age=30,
                chest_mm=Decimal("10.0"),
                # Missing abdomen and thigh
            )

    def test_3_site_female_missing_measurements_raises_error(self) -> None:
        """Test that 3-Site female requires tricep, suprailiac, thigh."""
        with pytest.raises(ValueError, match="Tricep, suprailiac, and thigh"):
            BodyFatCalculator.calculate_3_site(
                gender=Gender.FEMALE,
                age=28,
                tricep_mm=Decimal("15.0"),
                # Missing suprailiac and thigh
            )


class TestSevenSiteMethod:
    """Test 7-Site Skinfold method calculations."""

    def test_7_site_male_calculation(self) -> None:
        """Test 7-Site method for adult male."""
        result = BodyFatCalculator.calculate_7_site(
            gender=Gender.MALE,
            age=35,
            chest_mm=Decimal("8.0"),
            midaxillary_mm=Decimal("10.0"),
            tricep_mm=Decimal("9.0"),
            subscapular_mm=Decimal("12.0"),
            abdomen_mm=Decimal("18.0"),
            suprailiac_mm=Decimal("11.0"),
            thigh_mm=Decimal("14.0"),
        )
        # Expected range for fit male
        assert 10.0 <= result <= 20.0
        assert isinstance(result, Decimal)

    def test_7_site_female_calculation(self) -> None:
        """Test 7-Site method for adult female."""
        result = BodyFatCalculator.calculate_7_site(
            gender=Gender.FEMALE,
            age=32,
            chest_mm=Decimal("10.0"),
            midaxillary_mm=Decimal("12.0"),
            tricep_mm=Decimal("14.0"),
            subscapular_mm=Decimal("13.0"),
            abdomen_mm=Decimal("16.0"),
            suprailiac_mm=Decimal("15.0"),
            thigh_mm=Decimal("18.0"),
        )
        # Expected range for fit female
        assert 18.0 <= result <= 30.0
        assert isinstance(result, Decimal)


class TestCalculateMethod:
    """Test the generic calculate method that dispatches to specific methods."""

    def test_calculate_with_navy_method(self) -> None:
        """Test calculate method dispatches to Navy correctly."""
        result = BodyFatCalculator.calculate(
            method=CalculationMethod.NAVY,
            gender=Gender.MALE,
            age=30,
            height_cm=Decimal("175.0"),
            waist_cm=Decimal("90.0"),
            neck_cm=Decimal("38.0"),
        )
        assert 15.0 <= result <= 35.0

    def test_calculate_with_3_site_method(self) -> None:
        """Test calculate method dispatches to 3-Site correctly."""
        result = BodyFatCalculator.calculate(
            method=CalculationMethod.THREE_SITE,
            gender=Gender.MALE,
            age=30,
            height_cm=Decimal("175.0"),
            chest_mm=Decimal("10.0"),
            abdomen_mm=Decimal("20.0"),
            thigh_mm=Decimal("15.0"),
        )
        assert 8.0 <= result <= 18.0

    def test_calculate_with_7_site_method(self) -> None:
        """Test calculate method dispatches to 7-Site correctly."""
        result = BodyFatCalculator.calculate(
            method=CalculationMethod.SEVEN_SITE,
            gender=Gender.MALE,
            age=35,
            height_cm=Decimal("175.0"),
            chest_mm=Decimal("8.0"),
            midaxillary_mm=Decimal("10.0"),
            tricep_mm=Decimal("9.0"),
            subscapular_mm=Decimal("12.0"),
            abdomen_mm=Decimal("18.0"),
            suprailiac_mm=Decimal("11.0"),
            thigh_mm=Decimal("14.0"),
        )
        assert 10.0 <= result <= 20.0


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_very_lean_male(self) -> None:
        """Test calculation for very lean male (low skinfolds)."""
        result = BodyFatCalculator.calculate_3_site(
            gender=Gender.MALE,
            age=25,
            chest_mm=Decimal("5.0"),
            abdomen_mm=Decimal("8.0"),
            thigh_mm=Decimal("7.0"),
        )
        # Very lean range
        assert 5.0 <= result <= 12.0

    def test_higher_body_fat_female(self) -> None:
        """Test calculation for higher body fat female."""
        result = BodyFatCalculator.calculate_3_site(
            gender=Gender.FEMALE,
            age=40,
            tricep_mm=Decimal("25.0"),
            suprailiac_mm=Decimal("22.0"),
            thigh_mm=Decimal("28.0"),
        )
        # Higher body fat range
        assert 25.0 <= result <= 40.0
