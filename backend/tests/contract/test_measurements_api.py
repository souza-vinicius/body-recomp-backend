"""
Contract tests for Measurements API endpoints.
Validates OpenAPI specification compliance for body measurement tracking.
"""
from datetime import datetime
from decimal import Decimal

from fastapi.testclient import TestClient


class TestMeasurementCreation:
    """Contract tests for POST /api/v1/measurements."""

    async def test_create_initial_measurement(
        self, client: TestClient, auth_headers: dict
    ):
        """
        Test creating initial body measurement with body fat calculation.

        Validates:
        - OpenAPI spec measurements endpoint
        - BodyMeasurementCreate schema
        - 201 status code
        - body_fat_percentage calculated and returned
        - US1 Acceptance #1: Input measurements for body fat calculation

        Constitution: Principle III, Principle I (OpenAPI compliance)
        """
        # Arrange - Navy method measurements
        measurement_data = {
            "weight_kg": 80.5,
            "calculation_method": "navy",
            "waist_cm": 90.0,
            "neck_cm": 38.0,
            "hip_cm": None,  # Not required for men
            "measured_at": datetime.now().isoformat(),
        }

        # Act
        response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 201

        data = response.json()

        # Validate response schema
        assert "id" in data
        assert "user_id" in data
        assert "weight_kg" in data
        assert "calculated_body_fat_percentage" in data
        assert "calculation_method" in data
        assert "measured_at" in data
        assert "created_at" in data

        # Validate calculated body fat
        assert data["calculated_body_fat_percentage"] is not None
        assert isinstance(
            data["calculated_body_fat_percentage"], (int, float, str)
        )
        bf_pct = float(data["calculated_body_fat_percentage"])
        assert 5.0 <= bf_pct <= 50.0

        # Validate data values
        assert data["weight_kg"] == measurement_data["weight_kg"]
        assert data["calculation_method"] == measurement_data["calculation_method"]
        assert data["waist_cm"] == measurement_data["waist_cm"]
        assert data["neck_cm"] == measurement_data["neck_cm"]

    async def test_create_measurement_3_site_male(
        self, client: TestClient, auth_headers: dict
    ):
        """Test creating measurement with 3-site skinfold method (male)."""
        # Arrange - 3-Site method (male)
        measurement_data = {
            "weight_kg": 85.0,
            "calculation_method": "3_site",
            "chest_mm": 12.0,
            "abdomen_mm": 20.0,
            "thigh_mm": 15.0,
            "measured_at": datetime.now().isoformat(),
        }

        # Act
        response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["calculated_body_fat_percentage"] is not None
        assert data["calculation_method"] == "3_site"

    async def test_create_measurement_missing_required_fields(
        self, client: TestClient, auth_headers: dict
    ):
        """
        Test measurement creation fails with missing required fields.

        Validates:
        - FR-006-B: Only fields needed for selected method are required
        - 422 status code for missing fields
        """
        # Arrange - Navy method without neck measurement
        measurement_data = {
            "weight_kg": 80.0,
            "calculation_method": "navy",
            "waist_cm": 90.0,
            # Missing neck_cm
        }

        # Act
        response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )

        # Assert
        assert response.status_code in [400, 422]
        data = response.json()
        assert "detail" in data

    async def test_create_measurement_invalid_weight(
        self, client: TestClient, auth_headers: dict
    ):
        """
        Test measurement creation fails with invalid weight.

        Validates:
        - Weight range validation (30-300 kg)
        - 422 status code
        """
        # Arrange - weight too low
        measurement_data = {
            "weight_kg": 20.0,  # Below minimum
            "calculation_method": "navy",
            "waist_cm": 90.0,
            "neck_cm": 38.0,
        }

        # Act
        response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 422

    async def test_create_measurement_requires_authentication(
        self, client: TestClient
    ):
        """
        Test measurement creation requires authentication.

        Validates:
        - 401 status code without auth headers
        - Constitution: Principle IV (authentication required)
        """
        # Arrange
        measurement_data = {
            "weight_kg": 80.5,
            "calculation_method": "navy",
            "waist_cm": 90.0,
            "neck_cm": 38.0,
            "measured_at": datetime.now().isoformat(),
        }

        # Act - No auth headers
        response = await client.post(
            "/api/v1/measurements", json=measurement_data
        )

        # Assert
        assert response.status_code == 401
