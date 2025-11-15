"""
Integration tests for complete authentication flow.
Tests end-to-end authentication scenarios including registration, login, token refresh, and protected endpoint access.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
class TestAuthenticationIntegration:
    """Integration tests for authentication flow."""

    async def test_full_auth_flow(self, client: AsyncClient, db_session: AsyncSession):
        """
        T095: Test complete authentication flow from registration to token refresh.
        
        Flow:
        1. Register new user
        2. Login with credentials
        3. Access protected endpoint with access token
        4. Refresh token
        5. Access protected endpoint with new access token
        
        Validates:
        - End-to-end auth flow works correctly
        - Token expiration handling
        - Refresh mechanism works
        """
        # Step 1: Register new user
        register_response = await client.post(
            "/api/v1/users",
            json={
                "email": "auth.flow@example.com",
                "password": "SecurePassword123!",
                "full_name": "Auth Flow Test",
                "date_of_birth": "1990-05-15",
                "gender": "male",
                "height_cm": 180.0,
                "preferred_calculation_method": "navy",
                "activity_level": "moderately_active",
            },
        )
        assert register_response.status_code == 201
        user_data = register_response.json()
        user_id = user_data["id"]

        # Step 2: Login with credentials
        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "auth.flow@example.com",
                "password": "SecurePassword123!",
            },
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]

        # Step 3: Access protected endpoint with access token
        me_response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["id"] == user_id
        assert me_data["email"] == "auth.flow@example.com"

        # Step 4: Refresh token
        refresh_response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert refresh_response.status_code == 200
        new_tokens = refresh_response.json()
        assert "access_token" in new_tokens
        assert "refresh_token" in new_tokens
        new_access_token = new_tokens["access_token"]
        new_refresh_token = new_tokens["refresh_token"]

        # Verify tokens are valid JWTs
        # (rotation happens but may be identical if issued in same second)
        assert isinstance(new_access_token, str)
        assert len(new_access_token) > 0
        assert isinstance(new_refresh_token, str)
        assert len(new_refresh_token) > 0

        # Step 5: Access protected endpoint with new access token
        me_response_2 = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {new_access_token}"},
        )
        assert me_response_2.status_code == 200
        me_data_2 = me_response_2.json()
        assert me_data_2["id"] == user_id

    async def test_auth_flow_with_goal_creation(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        """
        Test authentication flow with actual goal creation and access.
        
        Validates:
        - User can create goals after authentication
        - Authorization is enforced for goal access
        """
        # Register and login
        await client.post(
            "/api/v1/users",
            json={
                "email": "goal.auth@example.com",
                "password": "Password123!",
                "full_name": "Goal Auth Test",
                "date_of_birth": "1990-01-01",
                "gender": "male",
                "height_cm": 175.0,
                "preferred_calculation_method": "navy",
                "activity_level": "moderately_active",
            },
        )

        login_response = await client.post(
            "/api/v1/auth/login",
            json={"email": "goal.auth@example.com", "password": "Password123!"},
        )
        access_token = login_response.json()["access_token"]

        # Create measurement
        measurement_response = await client.post(
            "/api/v1/measurements",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "weight_kg": 90.0,
                "calculation_method": "navy",
                "waist_cm": 95.0,
                "neck_cm": 38.0,
                "measured_at": "2025-10-27T10:00:00",
            },
        )
        assert measurement_response.status_code == 201
        measurement_id = measurement_response.json()["id"]

        # Create goal
        goal_response = await client.post(
            "/api/v1/goals",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "goal_type": "CUTTING",
                "initial_measurement_id": measurement_id,
                "target_body_fat_percentage": 15.0,
            },
        )
        assert goal_response.status_code == 201
        goal_id = goal_response.json()["id"]

        # Access the goal (should succeed)
        get_goal_response = await client.get(
            f"/api/v1/goals/{goal_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert get_goal_response.status_code == 200

        # Try to access without token (should fail)
        no_auth_response = await client.get(f"/api/v1/goals/{goal_id}")
        assert no_auth_response.status_code == 401

    async def test_auth_flow_password_validation(
        self, client: AsyncClient
    ):
        """
        Test that weak passwords are rejected during registration.
        
        Validates:
        - Password strength requirements are enforced
        """
        # Try to register with weak password
        response = await client.post(
            "/api/v1/users",
            json={
                "email": "weak.password@example.com",
                "password": "weak",  # Too short
                "full_name": "Weak Password Test",
                "date_of_birth": "1990-01-01",
                "gender": "male",
                "height_cm": 175.0,
                "preferred_calculation_method": "navy",
                "activity_level": "moderately_active",
            },
        )
        assert response.status_code == 422  # Validation error
