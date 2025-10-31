"""
Unit tests for measurement validation service.
"""
from decimal import Decimal


from src.models.enums import Gender
from src.services.validation_service import MeasurementValidator


class TestBodyFatValidation:
    """Test body fat percentage validation."""

    def test_valid_male_body_fat(self):
        """Test valid body fat percentage for male."""
        is_valid, error = MeasurementValidator.validate_body_fat_range(
            Decimal("15.0"), Gender.MALE
        )
        assert is_valid is True
        assert error is None

    def test_valid_female_body_fat(self):
        """Test valid body fat percentage for female."""
        is_valid, error = MeasurementValidator.validate_body_fat_range(
            Decimal("25.0"), Gender.FEMALE
        )
        assert is_valid is True
        assert error is None

    def test_male_body_fat_too_low(self):
        """Test male body fat below minimum."""
        is_valid, error = MeasurementValidator.validate_body_fat_range(
            Decimal("4.0"), Gender.MALE
        )
        assert is_valid is False
        assert "too low" in error.lower()
        assert "5.0" in error

    def test_female_body_fat_too_low(self):
        """Test female body fat below minimum."""
        is_valid, error = MeasurementValidator.validate_body_fat_range(
            Decimal("7.0"), Gender.FEMALE
        )
        assert is_valid is False
        assert "too low" in error.lower()
        assert "8.0" in error

    def test_body_fat_too_high(self):
        """Test body fat above maximum."""
        is_valid, error = MeasurementValidator.validate_body_fat_range(
            Decimal("55.0"), Gender.MALE
        )
        assert is_valid is False
        assert "too high" in error.lower()
        assert "50.0" in error

    def test_boundary_values(self):
        """Test boundary values for body fat."""
        # Male minimum
        is_valid, _ = MeasurementValidator.validate_body_fat_range(
            Decimal("5.0"), Gender.MALE
        )
        assert is_valid is True

        # Male maximum
        is_valid, _ = MeasurementValidator.validate_body_fat_range(
            Decimal("50.0"), Gender.MALE
        )
        assert is_valid is True

        # Female minimum
        is_valid, _ = MeasurementValidator.validate_body_fat_range(
            Decimal("8.0"), Gender.FEMALE
        )
        assert is_valid is True

        # Female maximum
        is_valid, _ = MeasurementValidator.validate_body_fat_range(
            Decimal("50.0"), Gender.FEMALE
        )
        assert is_valid is True


class TestTargetSafety:
    """Test target body fat safety validation."""

    def test_safe_male_target(self):
        """Test safe target for male."""
        is_valid, error = MeasurementValidator.validate_target_safety(
            Decimal("12.0"), Gender.MALE
        )
        assert is_valid is True
        assert error is None

    def test_safe_female_target(self):
        """Test safe target for female."""
        is_valid, error = MeasurementValidator.validate_target_safety(
            Decimal("20.0"), Gender.FEMALE
        )
        assert is_valid is True
        assert error is None

    def test_unsafe_male_target(self):
        """Test unsafe target for male."""
        is_valid, error = MeasurementValidator.validate_target_safety(
            Decimal("6.0"), Gender.MALE
        )
        assert is_valid is False
        assert "too low" in error.lower()
        assert "8.0" in error

    def test_unsafe_female_target(self):
        """Test unsafe target for female."""
        is_valid, error = MeasurementValidator.validate_target_safety(
            Decimal("12.0"), Gender.FEMALE
        )
        assert is_valid is False
        assert "too low" in error.lower()
        assert "15.0" in error

    def test_boundary_targets(self):
        """Test boundary values for safe targets."""
        # Male minimum safe
        is_valid, _ = MeasurementValidator.validate_target_safety(
            Decimal("8.0"), Gender.MALE
        )
        assert is_valid is True

        # Female minimum safe
        is_valid, _ = MeasurementValidator.validate_target_safety(
            Decimal("15.0"), Gender.FEMALE
        )
        assert is_valid is True


class TestWeightValidation:
    """Test weight validation."""

    def test_valid_weight(self):
        """Test valid weight."""
        is_valid, error = MeasurementValidator.validate_weight(Decimal("75.0"))
        assert is_valid is True
        assert error is None

    def test_weight_too_low(self):
        """Test weight below minimum."""
        is_valid, error = MeasurementValidator.validate_weight(Decimal("25.0"))
        assert is_valid is False
        assert "too low" in error.lower()
        assert "30.0" in error

    def test_weight_too_high(self):
        """Test weight above maximum."""
        is_valid, error = MeasurementValidator.validate_weight(Decimal("350.0"))
        assert is_valid is False
        assert "too high" in error.lower()
        assert "300.0" in error

    def test_weight_boundaries(self):
        """Test boundary values for weight."""
        # Minimum
        is_valid, _ = MeasurementValidator.validate_weight(Decimal("30.0"))
        assert is_valid is True

        # Maximum
        is_valid, _ = MeasurementValidator.validate_weight(Decimal("300.0"))
        assert is_valid is True


class TestCircumferenceValidation:
    """Test circumference validation."""

    def test_valid_circumference(self):
        """Test valid circumference."""
        is_valid, error = MeasurementValidator.validate_circumference(
            Decimal("90.0"), "waist"
        )
        assert is_valid is True
        assert error is None

    def test_circumference_too_small(self):
        """Test circumference below minimum."""
        is_valid, error = MeasurementValidator.validate_circumference(
            Decimal("5.0"), "neck"
        )
        assert is_valid is False
        assert "too small" in error.lower()
        assert "neck" in error.lower()
        assert "10.0" in error

    def test_circumference_too_large(self):
        """Test circumference above maximum."""
        is_valid, error = MeasurementValidator.validate_circumference(
            Decimal("250.0"), "hip"
        )
        assert is_valid is False
        assert "too large" in error.lower()
        assert "hip" in error.lower()
        assert "200.0" in error

    def test_circumference_boundaries(self):
        """Test boundary values for circumference."""
        # Minimum
        is_valid, _ = MeasurementValidator.validate_circumference(
            Decimal("10.0"), "wrist"
        )
        assert is_valid is True

        # Maximum
        is_valid, _ = MeasurementValidator.validate_circumference(
            Decimal("200.0"), "waist"
        )
        assert is_valid is True


class TestSkinfoldValidation:
    """Test skinfold validation."""

    def test_valid_skinfold(self):
        """Test valid skinfold."""
        is_valid, error = MeasurementValidator.validate_skinfold(
            Decimal("15.0"), "chest"
        )
        assert is_valid is True
        assert error is None

    def test_skinfold_too_small(self):
        """Test skinfold below minimum."""
        is_valid, error = MeasurementValidator.validate_skinfold(
            Decimal("0.5"), "tricep"
        )
        assert is_valid is False
        assert "too small" in error.lower()
        assert "tricep" in error.lower()
        assert "1.0" in error

    def test_skinfold_too_large(self):
        """Test skinfold above maximum."""
        is_valid, error = MeasurementValidator.validate_skinfold(
            Decimal("70.0"), "abdomen"
        )
        assert is_valid is False
        assert "too large" in error.lower()
        assert "abdomen" in error.lower()
        assert "60.0" in error

    def test_skinfold_boundaries(self):
        """Test boundary values for skinfold."""
        # Minimum
        is_valid, _ = MeasurementValidator.validate_skinfold(
            Decimal("1.0"), "chest"
        )
        assert is_valid is True

        # Maximum
        is_valid, _ = MeasurementValidator.validate_skinfold(
            Decimal("60.0"), "thigh"
        )
        assert is_valid is True


class TestBulkValidation:
    """Test bulk measurement validation."""

    def test_all_valid_measurements(self):
        """Test all measurements valid."""
        errors = MeasurementValidator.validate_measurements(
            weight_kg=Decimal("75.0"),
            circumferences={
                "neck": Decimal("38.0"),
                "waist": Decimal("85.0"),
                "hip": Decimal("100.0"),
            },
            skinfolds={
                "chest": Decimal("12.0"),
                "abdomen": Decimal("18.0"),
                "thigh": Decimal("15.0"),
            },
        )
        assert len(errors) == 0

    def test_multiple_errors(self):
        """Test multiple validation errors."""
        errors = MeasurementValidator.validate_measurements(
            weight_kg=Decimal("25.0"),  # Too low
            circumferences={
                "neck": Decimal("5.0"),  # Too small
                "waist": Decimal("250.0"),  # Too large
            },
            skinfolds={
                "chest": Decimal("0.5"),  # Too small
                "thigh": Decimal("70.0"),  # Too large
            },
        )
        assert len(errors) == 5
        assert any("weight" in e.lower() for e in errors)
        assert any("neck" in e.lower() for e in errors)
        assert any("waist" in e.lower() for e in errors)
        assert any("chest" in e.lower() for e in errors)
        assert any("thigh" in e.lower() for e in errors)

    def test_none_values_ignored(self):
        """Test None values are ignored."""
        errors = MeasurementValidator.validate_measurements(
            weight_kg=Decimal("75.0"),
            circumferences={
                "neck": Decimal("38.0"),
                "waist": None,  # Should be ignored
            },
            skinfolds={
                "chest": None,  # Should be ignored
                "abdomen": Decimal("18.0"),
            },
        )
        assert len(errors) == 0
