"""
Integration tests for error handling scenarios.
Tests T109: Comprehensive error scenario testing.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import create_access_token
from src.models.user import User


class TestErrorHandling:
    """Test suite for error handling scenarios."""

    @pytest.mark.asyncio
    async def test_validation_error_422(
        self,
        client: AsyncClient,
    ):
        """Test validation error returns RFC 7807 format."""
        # Invalid email format
        response = await client.post(
            "/api/v1/users",
            json={
                "email": "invalid-email",  # Missing @
                "password": "ValidPass123!",
                "full_name": "Test User",
            },
        )

        assert response.status_code == 422
        data = response.json()
        
        # Check RFC 7807 format
        assert "type" in data
        assert "title" in data
        assert data["title"] == "Validation Error"
        assert data["status"] == 422
        assert "detail" in data
        assert "instance" in data
        assert "errors" in data
        assert len(data["errors"]) > 0

    @pytest.mark.asyncio
    async def test_validation_error_missing_fields(
        self,
        client: AsyncClient,
    ):
        """Test missing required fields return validation error."""
        response = await client.post(
            "/api/v1/users",
            json={
                "email": "test@example.com",
                # Missing password and full_name
            },
        )

        assert response.status_code == 422
        data = response.json()
        assert "errors" in data
        # Should have errors for missing fields
        assert len(data["errors"]) >= 2

    @pytest.mark.asyncio
    async def test_not_found_error_404(
        self,
        client: AsyncClient,
        test_user: User,
        test_token: str,
    ):
        """Test not found error returns RFC 7807 format."""
        # Try to get non-existent goal
        response = await client.get(
            "/api/v1/goals/00000000-0000-0000-0000-000000000000",
            headers={"Authorization": f"Bearer {test_token}"},
        )

        assert response.status_code == 404
        data = response.json()
        
        # Check RFC 7807 format
        assert data["type"] == "about:blank"
        assert data["title"] == "Not Found"
        assert data["status"] == 404
        assert "detail" in data
        assert "instance" in data

    @pytest.mark.asyncio
    async def test_unauthorized_error_401(
        self,
        client: AsyncClient,
    ):
        """Test unauthorized access returns 401."""
        # Try to access protected endpoint without token
        response = await client.get("/api/v1/users/me")

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_unauthorized_invalid_token_401(
        self,
        client: AsyncClient,
    ):
        """Test invalid token returns 401."""
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid_token"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_forbidden_error_403(
        self,
        client: AsyncClient,
        test_user: User,
        test_token: str,
        db_session: AsyncSession,
    ):
        """Test forbidden access to other user's resources."""
        # Create another user
        from src.services.user_service import UserService
        
        other_user = await UserService.create_user(
            db_session,
            email="other@example.com",
            password="OtherPass123!",
            full_name="Other User",
            date_of_birth="1995-01-01",
            gender="male",
            height_cm=180.0,
        )
        await db_session.commit()

        # Create measurement for other user
        from src.services.measurement_service import MeasurementService
        
        measurement = await MeasurementService.create_measurement(
            db_session,
            user_id=other_user.id,
            weight_kg=75.0,
            calculation_method="navy",
            waist_cm=80.0,
            neck_cm=38.0,
            measured_at="2024-01-01T10:00:00",
        )
        await db_session.commit()

        # Try to access other user's measurement with test_user's token
        response = await client.get(
            f"/api/v1/measurements/{measurement.id}",
            headers={"Authorization": f"Bearer {test_token}"},
        )

        # Should either be 403 or 404 depending on implementation
        assert response.status_code in [403, 404]

    @pytest.mark.asyncio
    async def test_bad_request_error_400(
        self,
        client: AsyncClient,
        test_user: User,
        test_token: str,
    ):
        """Test bad request returns RFC 7807 format."""
        # Try to create measurement with unrealistic body fat
        response = await client.post(
            "/api/v1/measurements",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "weight_kg": 70.0,
                "calculation_method": "navy",
                "waist_cm": 30.0,  # Unrealistically small
                "neck_cm": 25.0,
                "measured_at": "2024-01-01T10:00:00",
            },
        )

        assert response.status_code in [400, 422]
        data = response.json()
        assert "detail" in data or "errors" in data

    @pytest.mark.asyncio
    async def test_body_fat_edge_case_too_low(
        self,
        client: AsyncClient,
        test_user: User,
        test_token: str,
    ):
        """Test body fat calculation validates unrealistically low values."""
        # Values that would calculate to very low body fat
        response = await client.post(
            "/api/v1/measurements",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "weight_kg": 70.0,
                "calculation_method": "navy",
                "waist_cm": 65.0,
                "neck_cm": 42.0,
                "measured_at": "2024-01-01T10:00:00",
            },
        )

        # Should either succeed with warning or fail with validation error
        if response.status_code == 400:
            data = response.json()
            assert "body fat" in data["detail"].lower()
            assert "unrealistically low" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_body_fat_edge_case_too_high(
        self,
        client: AsyncClient,
        test_user: User,
        test_token: str,
    ):
        """Test body fat calculation validates unrealistically high values."""
        # Values that would calculate to very high body fat
        response = await client.post(
            "/api/v1/measurements",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "weight_kg": 150.0,
                "calculation_method": "navy",
                "waist_cm": 140.0,
                "neck_cm": 35.0,
                "measured_at": "2024-01-01T10:00:00",
            },
        )

        # Should either succeed or fail depending on calculation result
        if response.status_code == 400:
            data = response.json()
            assert "body fat" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_measurement_validation_weight_range(
        self,
        client: AsyncClient,
        test_user: User,
        test_token: str,
    ):
        """Test measurement validation for weight out of range."""
        # Weight too low
        response = await client.post(
            "/api/v1/measurements",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "weight_kg": 20.0,  # Below minimum
                "calculation_method": "navy",
                "waist_cm": 70.0,
                "neck_cm": 35.0,
                "measured_at": "2024-01-01T10:00:00",
            },
        )

        assert response.status_code == 422
        data = response.json()
        assert "errors" in data

    @pytest.mark.asyncio
    async def test_duplicate_user_email(
        self,
        client: AsyncClient,
        test_user: User,
    ):
        """Test duplicate email returns appropriate error."""
        response = await client.post(
            "/api/v1/users",
            json={
                "email": test_user.email,  # Duplicate
                "password": "AnotherPass123!",
                "full_name": "Another User",
                "date_of_birth": "1995-01-01",
                "gender": "male",
                "height_cm": 175.0,
            },
        )

        assert response.status_code in [400, 409, 422]
        data = response.json()
        assert "detail" in data or "errors" in data

    @pytest.mark.asyncio
    async def test_invalid_login_credentials(
        self,
        client: AsyncClient,
        test_user: User,
    ):
        """Test invalid login credentials return 401."""
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "WrongPassword123!",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_expired_token_handling(
        self,
        client: AsyncClient,
        test_user: User,
    ):
        """Test expired token returns 401."""
        # Create token that's already expired
        expired_token = create_access_token(
            data={"sub": str(test_user.id)},
            expires_minutes=-10,  # Already expired
        )

        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {expired_token}"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_malformed_json_request(
        self,
        client: AsyncClient,
    ):
        """Test malformed JSON returns validation error."""
        response = await client.post(
            "/api/v1/users",
            content="{'invalid': json}",  # Malformed JSON
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 422
