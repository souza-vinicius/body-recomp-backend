"""
Contract tests for Users API endpoints.
Validates OpenAPI specification compliance for user registration and profile management.
"""
import pytest
from decimal import Decimal
from datetime import date

from fastapi.testclient import TestClient

from src.api.main import app
from src.schemas.user import UserResponse


class TestUserRegistration:
    """Contract tests for POST /api/v1/users (user registration)."""

    async def test_register_user_success(self, client: TestClient):
        """
        Test successful user registration.

        Validates:
        - OpenAPI spec lines 47-106
        - UserCreate schema validation
        - UserResponse schema returned
        - 201 status code
        - Password not exposed in response
        - US1 Acceptance #1: New user can register

        Constitution: Principle III (contract tests first), Principle I (OpenAPI compliance)
        """
        # Arrange
        user_data = {
            "email": "john.doe@example.com",
            "password": "SecurePass123!",
            "full_name": "John Doe",
            "date_of_birth": "1990-05-15",
            "gender": "male",
            "height_cm": 175.5,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        # Act
        response = await client.post("/api/v1/users", json=user_data)

        # Assert
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"

        data = response.json()

        # Validate UserResponse schema
        assert "id" in data
        assert "email" in data
        assert "full_name" in data
        assert "date_of_birth" in data
        assert "gender" in data
        assert "height_cm" in data
        assert "preferred_calculation_method" in data
        assert "activity_level" in data
        assert "created_at" in data
        assert "updated_at" in data

        # Validate password is NOT exposed
        assert "password" not in data
        assert "hashed_password" not in data

        # Validate data values
        assert data["email"] == user_data["email"]
        assert data["full_name"] == user_data["full_name"]
        assert data["date_of_birth"] == user_data["date_of_birth"]
        assert data["gender"] == user_data["gender"]
        assert data["height_cm"] == user_data["height_cm"]
        assert data["preferred_calculation_method"] == user_data["preferred_calculation_method"]
        assert data["activity_level"] == user_data["activity_level"]

    async def test_register_user_duplicate_email(self, client: TestClient):
        """
        Test user registration fails with duplicate email.

        Validates:
        - Email uniqueness constraint
        - 400 status code
        - Error message in response

        Constitution: Principle IV (user isolation)
        """
        # Arrange
        user_data = {
            "email": "duplicate@example.com",
            "password": "SecurePass123!",
            "full_name": "First User",
            "date_of_birth": "1990-05-15",
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        # Create first user
        response1 = await client.post("/api/v1/users", json=user_data)
        assert response1.status_code == 201

        # Act - Try to create duplicate
        user_data["full_name"] = "Second User"
        response2 = await client.post("/api/v1/users", json=user_data)

        # Assert
        assert response2.status_code == 400
        data = response2.json()
        assert "detail" in data
        assert "email" in data["detail"].lower() or "already" in data["detail"].lower()

    async def test_register_user_invalid_email(self, client: TestClient):
        """
        Test user registration fails with invalid email format.

        Validates:
        - Email format validation
        - 422 status code
        - Validation error details
        """
        # Arrange
        user_data = {
            "email": "not-an-email",
            "password": "SecurePass123!",
            "full_name": "John Doe",
            "date_of_birth": "1990-05-15",
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        # Act
        response = await client.post("/api/v1/users", json=user_data)

        # Assert
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    async def test_register_user_weak_password(self, client: TestClient):
        """
        Test user registration fails with weak password.

        Validates:
        - Password strength requirement (min 8 characters)
        - 422 status code
        """
        # Arrange
        user_data = {
            "email": "test@example.com",
            "password": "weak",
            "full_name": "John Doe",
            "date_of_birth": "1990-05-15",
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        # Act
        response = await client.post("/api/v1/users", json=user_data)

        # Assert
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    async def test_register_user_invalid_height(self, client: TestClient):
        """
        Test user registration fails with height outside valid range.

        Validates:
        - Height range validation (120-250 cm)
        - 422 status code
        """
        # Arrange - height too low
        user_data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "full_name": "John Doe",
            "date_of_birth": "1990-05-15",
            "gender": "male",
            "height_cm": 100.0,  # Below minimum
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        # Act
        response = await client.post("/api/v1/users", json=user_data)

        # Assert
        assert response.status_code == 422

    async def test_register_user_invalid_age(self, client: TestClient):
        """
        Test user registration fails with invalid age (under 13).

        Validates:
        - Age validation (min 13 years)
        - 422 status code
        """
        # Arrange - user too young
        user_data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "full_name": "Young User",
            "date_of_birth": "2020-01-01",  # Too young
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        # Act
        response = await client.post("/api/v1/users", json=user_data)

        # Assert
        assert response.status_code == 422
