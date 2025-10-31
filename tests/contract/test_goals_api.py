"""
Contract tests for Goals API endpoints.
Validates OpenAPI specification compliance for goal management.
"""
from fastapi.testclient import TestClient


class TestGoalCreation:
    """Contract tests for POST /api/v1/goals."""

    async def test_create_cutting_goal(
        self, client: TestClient, auth_headers: dict, test_measurement: dict
    ):
        """
        Test creating a cutting goal with caloric deficit.

        Validates:
        - OpenAPI spec goals endpoint
        - GoalCreate schema
        - 201 status code
        - GoalResponse with timeline, caloric recommendations
        - US1 Acceptance #1-4: Create cutting goal

        Constitution: Principle III, Principle I (OpenAPI compliance)
        Functional Requirements: FR-003 (cutting validation), FR-005 (caloric deficit)
        """
        # Arrange
        goal_data = {
            "goal_type": "cutting",
            "initial_measurement_id": test_measurement["id"],
            "target_body_fat_percentage": 12.0,
        }

        # Act
        response = await client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 201

        data = response.json()

        # Validate response schema per OpenAPI spec
        assert "id" in data
        assert "user_id" in data
        assert "goal_type" in data
        assert "status" in data
        assert "initial_measurement_id" in data
        assert "initial_body_fat_percentage" in data
        assert "target_body_fat_percentage" in data
        assert "initial_weight_kg" in data
        assert "target_calories" in data
        assert "estimated_weeks_to_goal" in data
        assert "current_body_fat_percentage" in data
        assert "progress_percentage" in data
        assert "weeks_elapsed" in data
        assert "is_on_track" in data
        assert "started_at" in data
        assert "created_at" in data
        assert "updated_at" in data

        # Validate goal values
        assert data["goal_type"] == "cutting"
        assert data["target_body_fat_percentage"] == 12.0
        assert data["status"] == "active"
        assert data["weeks_elapsed"] == 0
        assert data["progress_percentage"] == 0.0

        # Validate target < current for cutting
        assert (
            data["target_body_fat_percentage"]
            < data["current_body_fat_percentage"]
        )

    async def test_create_bulking_goal(
        self, client: TestClient, auth_headers: dict, test_measurement: dict
    ):
        """Test creating a bulking goal with caloric surplus."""
        # Arrange
        goal_data = {
            "goal_type": "bulking",
            "initial_measurement_id": test_measurement["id"],
            "ceiling_body_fat_percentage": 25.0,  # Higher than current 22.5%
        }

        # Act
        response = await client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["goal_type"] == "bulking"
        assert data["ceiling_body_fat_percentage"] == 25.0
        assert data["status"] == "active"

        # Validate target_calories > 0 (should be surplus)
        assert data["target_calories"] > 0

    async def test_create_goal_unsafe_target(
        self, client: TestClient, auth_headers: dict, test_measurement: dict
    ):
        """
        Test goal creation fails with unsafe target body fat.

        Validates:
        - FR-017: Safety limits (men <8%, women <15%)
        - 400 status code
        """
        # Arrange - unsafe target for male
        goal_data = {
            "goal_type": "cutting",
            "initial_measurement_id": test_measurement["id"],
            "target_body_fat_percentage": 6.0,  # Unsafe for men
        }

        # Act
        response = await client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "safe" in data["detail"].lower() or "low" in data["detail"].lower()

    async def test_create_goal_requires_measurement(
        self, client: TestClient, auth_headers: dict
    ):
        """
        Test goal creation requires an initial measurement.

        Validates:
        - Cannot create goal without measurement
        - 400 status code
        """
        # Arrange - no initial_measurement_id provided
        goal_data = {
            "goal_type": "cutting",
            "target_body_fat_percentage": 12.0,
        }

        # Act
        response = await client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    async def test_create_goal_one_active_per_user(
        self, client: TestClient, auth_headers: dict, test_measurement: dict
    ):
        """
        Test only one active goal allowed per user.

        Validates:
        - FR-018: One active goal per user
        - 403 status code on second goal (per OpenAPI spec)
        """
        # Arrange - create first goal
        goal_data = {
            "goal_type": "cutting",
            "initial_measurement_id": test_measurement["id"],
            "target_body_fat_percentage": 12.0,
        }

        response1 = await client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )
        assert response1.status_code == 201

        # Act - try to create second goal
        goal_data2 = {
            "goal_type": "bulking",
            "initial_measurement_id": test_measurement["id"],
            "ceiling_body_fat_percentage": 25.0,  # Higher than current 22.5%
        }

        response2 = await client.post(
            "/api/v1/goals",
            json=goal_data2,
            headers=auth_headers,
        )

        # Assert
        assert response2.status_code == 403
        data = response2.json()
        assert "detail" in data
        assert "active" in data["detail"].lower()

    async def test_bulking_ceiling_alert(
        self, client: TestClient, auth_headers: dict
    ):
        """
        Test bulking goal creation with ceiling validation.

        T056: Contract test for goal ceiling alert

        Validates:
        - GoalResponse includes validation for ceiling
        - Ceiling must be higher than current body fat
        - Ceiling must be within safe limits
        - US3 Acceptance #4: Alert when reaching ceiling

        Constitution: Principle III, Principle I
        Functional Requirements: FR-017 (safety limits)
        """
        # First create a measurement at ~14-15% BF
        from datetime import datetime

        measurement_data = {
            "weight_kg": 75.0,
            "calculation_method": "navy",
            "waist_cm": 75.0,  # Lower waist for lower BF%
            "neck_cm": 40.0,  # Higher neck for lower BF%
            "measured_at": datetime.now().isoformat(),
        }
        measurement_response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )
        assert measurement_response.status_code == 201
        measurement_id = measurement_response.json()["id"]

        # Test 1: Ceiling too low (below current BF) should fail
        goal_data_low = {
            "goal_type": "bulking",
            "initial_measurement_id": measurement_id,
            "ceiling_body_fat_percentage": 10.0,  # Below current
        }
        response_low = await client.post(
            "/api/v1/goals",
            json=goal_data_low,
            headers=auth_headers,
        )
        assert response_low.status_code == 400  # Business rule validation

        # Test 2: Ceiling too high (unsafe) should fail
        goal_data_high = {
            "goal_type": "bulking",
            "initial_measurement_id": measurement_id,
            "ceiling_body_fat_percentage": 35.0,  # Too high for male
        }
        response_high = await client.post(
            "/api/v1/goals",
            json=goal_data_high,
            headers=auth_headers,
        )
        assert response_high.status_code == 400  # Business rule validation

        # Test 3: Valid ceiling should succeed
        goal_data_valid = {
            "goal_type": "bulking",
            "initial_measurement_id": measurement_id,
            "ceiling_body_fat_percentage": 18.0,  # Safe range
        }
        response_valid = await client.post(
            "/api/v1/goals",
            json=goal_data_valid,
            headers=auth_headers,
        )
        assert response_valid.status_code == 201
        data = response_valid.json()
        assert data["ceiling_body_fat_percentage"] == 18.0


class TestGoalRetrieval:
    """Contract tests for GET /api/v1/goals/{id}."""

    async def test_get_goal_by_id(
        self, client: TestClient, auth_headers: dict, test_goal: dict
    ):
        """
        Test retrieving a goal by ID.

        Validates:
        - OpenAPI spec
        - GoalResponse schema
        - 200 status code
        - US1 Acceptance #4: View current vs target, timeline, caloric deficit

        Constitution: Principle III, Principle I
        """
        # Act
        response = await client.get(
            f"/api/v1/goals/{test_goal['id']}",
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 200

        data = response.json()

        # Validate complete goal details per OpenAPI spec
        assert data["id"] == test_goal["id"]
        assert "current_body_fat_percentage" in data
        assert "target_body_fat_percentage" in data
        assert "estimated_weeks_to_goal" in data
        assert "target_calories" in data
        assert "started_at" in data

    async def test_get_goal_not_found(
        self, client: TestClient, auth_headers: dict
    ):
        """Test retrieving non-existent goal returns 404."""
        # Arrange
        fake_id = "00000000-0000-0000-0000-000000000000"

        # Act
        response = await client.get(
            f"/api/v1/goals/{fake_id}",
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 404

    async def test_get_goal_requires_authentication(self, client: TestClient):
        """Test goal retrieval requires authentication."""
        # Arrange
        fake_id = "00000000-0000-0000-0000-000000000000"

        # Act - No auth headers
        response = await client.get(f"/api/v1/goals/{fake_id}")

        # Assert
        assert response.status_code == 401

    async def test_get_goal_user_isolation(
        self, client: TestClient, auth_headers: dict, other_user_goal: dict
    ):
        """
        Test users cannot access other users' goals.

        Validates:
        - Constitution: Principle IV (user isolation)
        - 403 or 404 status code
        """
        # Act - Try to access another user's goal
        response = await client.get(
            f"/api/v1/goals/{other_user_goal['id']}",
            headers=auth_headers,
        )

        # Assert
        assert response.status_code in [403, 404]
