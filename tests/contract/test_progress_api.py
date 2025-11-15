"""Contract tests for Progress API endpoints.

Tests verify API compliance with OpenAPI specification for progress tracking endpoints.
Following Test-First Development (TFD) principle - written before implementation.
"""

from datetime import datetime, timedelta
from uuid import uuid4

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestProgressContractTests:
    """Contract tests for progress tracking endpoints."""

    async def test_log_progress_entry_success(self, client: AsyncClient, test_user_with_goal):
        """Test POST /api/v1/goals/{goal_id}/progress - log weekly progress entry.

        Contract: OpenAPI spec POST /api/v1/goals/{goal_id}/progress
        Scenario: User logs weekly measurement after 7+ days from goal start
        Expected: 201 status, ProgressEntry response with updated body fat percentage
        Constitution: Principle III (contract tests first), Principle I (OpenAPI compliance)
        """
        goal_id = test_user_with_goal["goal_id"]
        auth_headers = test_user_with_goal["auth_headers"]

        # Create a new measurement for week 1 (simulate 7 days later)
        measurement_data = {
            "weight_kg": 79.0,  # Lost 1kg
            "calculation_method": "navy",
            "waist_cm": 84.0,  # Reduced from 85cm
            "neck_cm": 38.0,
            "measured_at": (datetime.now() + timedelta(days=7)).isoformat()
        }

        measurement_response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers
        )
        assert measurement_response.status_code == 201
        measurement_id = measurement_response.json()["id"]

        # Log progress entry
        progress_data = {
            "measurement_id": measurement_id,
            "notes": "First week - feeling good, diet going well"
        }

        response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=progress_data,
            headers=auth_headers
        )

        # Validate contract compliance
        assert response.status_code == 201
        data = response.json()

        # Validate response schema per OpenAPI spec
        assert "id" in data
        assert "goal_id" in data
        assert data["goal_id"] == str(goal_id)
        assert "measurement_id" in data
        assert data["measurement_id"] == measurement_id
        assert "week_number" in data
        assert data["week_number"] == 1
        assert "body_fat_percentage" in data
        assert isinstance(data["body_fat_percentage"], (int, float))
        assert "weight_kg" in data
        assert data["weight_kg"] == 79.0
        assert "body_fat_change" in data
        assert "weight_change_kg" in data
        assert "is_on_track" in data
        assert isinstance(data["is_on_track"], bool)
        assert "notes" in data
        assert "logged_at" in data

    async def test_log_progress_entry_too_soon_fails(self, client: AsyncClient, test_user_with_goal):
        """Test POST /api/v1/goals/{goal_id}/progress - reject if less than 7 days.

        Contract: FR-009 (minimum 7 days between measurements)
        Expected: 400 Bad Request
        """
        goal_id = test_user_with_goal["goal_id"]
        auth_headers = test_user_with_goal["auth_headers"]

        # Create measurement only 3 days later (too soon)
        measurement_data = {
            "weight_kg": 79.5,
            "calculation_method": "navy",
            "waist_cm": 84.5,
            "neck_cm": 38.0,
            "measured_at": (datetime.now() + timedelta(days=3)).isoformat()
        }

        measurement_response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers
        )
        measurement_id = measurement_response.json()["id"]

        progress_data = {
            "measurement_id": measurement_id,
            "notes": "Too soon"
        }

        response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=progress_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        assert "detail" in response.json()

    async def test_log_progress_entry_invalid_measurement_fails(
        self, client: AsyncClient, test_user_with_goal
    ):
        """Test POST /api/v1/goals/{goal_id}/progress - reject invalid measurement_id.

        Contract: Foreign key validation
        Expected: 404 Not Found
        """
        goal_id = test_user_with_goal["goal_id"]
        auth_headers = test_user_with_goal["auth_headers"]

        progress_data = {
            "measurement_id": str(uuid4()),  # Non-existent measurement
            "notes": "Invalid measurement"
        }

        response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=progress_data,
            headers=auth_headers
        )

        assert response.status_code == 404

    async def test_get_progress_history_success(
        self, client: AsyncClient, test_user_with_goal_and_progress
    ):
        """Test GET /api/v1/goals/{goal_id}/progress - retrieve all progress entries.

        Contract: OpenAPI spec GET /api/v1/goals/{goal_id}/progress
        Scenario: User views trend chart of body fat over time
        Expected: 200 status, array of ProgressEntry ordered chronologically
        Constitution: Principle III, Principle I
        """
        goal_id = test_user_with_goal_and_progress["goal_id"]
        auth_headers = test_user_with_goal_and_progress["auth_headers"]

        response = await client.get(
            f"/api/v1/goals/{goal_id}/progress",
            headers=auth_headers
        )

        # Validate contract compliance
        assert response.status_code == 200
        data = response.json()

        # Validate response is array
        assert isinstance(data, list)
        assert len(data) > 0

        # Validate first entry schema
        first_entry = data[0]
        assert "id" in first_entry
        assert "goal_id" in first_entry
        assert "measurement_id" in first_entry
        assert "week_number" in first_entry
        assert "body_fat_percentage" in first_entry
        assert "weight_kg" in first_entry
        assert "body_fat_change" in first_entry
        assert "weight_change_kg" in first_entry
        assert "is_on_track" in first_entry
        assert "logged_at" in first_entry

        # Validate chronological order (week_number ascending)
        if len(data) > 1:
            for i in range(len(data) - 1):
                assert data[i]["week_number"] <= data[i + 1]["week_number"]

    async def test_get_progress_history_empty_goal(
        self, client: AsyncClient, test_user_with_goal
    ):
        """Test GET /api/v1/goals/{goal_id}/progress - empty array for goal without progress.

        Expected: 200 status, empty array
        """
        goal_id = test_user_with_goal["goal_id"]
        auth_headers = test_user_with_goal["auth_headers"]

        response = await client.get(
            f"/api/v1/goals/{goal_id}/progress",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    async def test_get_progress_history_invalid_goal_fails(
        self, client: AsyncClient
    ):
        """Test GET /api/v1/goals/{goal_id}/progress - requires authentication.

        Expected: 401 Unauthorized without auth token
        """
        response = await client.get(f"/api/v1/goals/{uuid4()}/progress")

        assert response.status_code == 401

    async def test_get_progress_trends_success(
        self, client: AsyncClient, test_user_with_goal_and_progress
    ):
        """Test GET /api/v1/goals/{goal_id}/trends - analyze progress trends.

        Contract: OpenAPI spec GET /api/v1/goals/{goal_id}/trends
        Scenario: User wants AI recommendations based on progress
        Expected: 200 status, TrendsResponse with analysis
        Constitution: Principle III, Principle I
        """
        goal_id = test_user_with_goal_and_progress["goal_id"]
        auth_headers = test_user_with_goal_and_progress["auth_headers"]

        response = await client.get(
            f"/api/v1/goals/{goal_id}/trends",
            headers=auth_headers
        )

        # Validate contract compliance
        assert response.status_code == 200
        data = response.json()

        # Validate TrendsResponse schema per OpenAPI spec
        assert "goal_id" in data
        assert data["goal_id"] == str(goal_id)
        assert "progress_percentage" in data
        assert isinstance(data["progress_percentage"], (int, float))
        assert "weeks_elapsed" in data
        assert isinstance(data["weeks_elapsed"], int)
        assert "is_on_track" in data
        assert isinstance(data["is_on_track"], bool)
        assert "weekly_bf_change_avg" in data
        assert "weekly_weight_change_avg" in data
        assert "trend" in data  # 'improving', 'plateau', 'worsening'
        assert data["trend"] in ["improving", "plateau", "worsening", "insufficient_data"]
        assert "adjustment_suggestion" in data
        assert isinstance(data["adjustment_suggestion"], (str, type(None)))
        assert "estimated_weeks_remaining" in data

    async def test_get_progress_trends_insufficient_data(
        self, client: AsyncClient, test_user_with_goal
    ):
        """Test GET /api/v1/goals/{goal_id}/trends - handle goal without progress entries.

        Expected: 200 status, insufficient_data trend classification
        """
        goal_id = test_user_with_goal["goal_id"]
        auth_headers = test_user_with_goal["auth_headers"]

        response = await client.get(
            f"/api/v1/goals/{goal_id}/trends",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["trend"] == "insufficient_data"
        assert data["progress_percentage"] == 0.0

    async def test_get_progress_trends_invalid_goal_fails(
        self, client: AsyncClient
    ):
        """Test GET /api/v1/goals/{goal_id}/trends - requires authentication.

        Expected: 401 Unauthorized without auth token
        """
        response = await client.get(f"/api/v1/goals/{uuid4()}/trends")

        assert response.status_code == 401


# Test fixtures

@pytest.fixture
async def test_user_with_goal(
    client: AsyncClient,
    test_user: dict,
    auth_headers: dict
):
    """Create a user with an active cutting goal for testing."""
    user_id = test_user["id"]

    # Create initial measurement
    measurement_data = {
        "weight_kg": 80.0,
        "calculation_method": "navy",
        "waist_cm": 85.0,
        "neck_cm": 38.0,
        "measured_at": datetime.now().isoformat()
    }
    measurement_response = await client.post(
        "/api/v1/measurements",
        json=measurement_data,
        headers=auth_headers
    )
    assert measurement_response.status_code == 201
    measurement_id = measurement_response.json()["id"]

    # Create cutting goal
    goal_data = {
        "goal_type": "CUTTING",
        "target_body_fat_percentage": 12.0,
        "activity_level": 3,
        "initial_measurement_id": measurement_id
    }
    goal_response = await client.post(
        "/api/v1/goals",
        json=goal_data,
        headers=auth_headers
    )
    assert goal_response.status_code == 201
    goal_id = goal_response.json()["id"]

    return {
        "user_id": user_id,
        "goal_id": goal_id,
        "measurement_id": measurement_id,
        "auth_headers": auth_headers
    }


@pytest.fixture
async def test_user_with_goal_and_progress(
    client: AsyncClient,
    test_user_with_goal: dict
):
    """Create a user with an active goal and 2 weeks of progress entries."""
    goal_id = test_user_with_goal["goal_id"]
    auth_headers = test_user_with_goal["auth_headers"]

    progress_entries = []

    # Week 1 progress
    measurement_data_week1 = {
        "weight_kg": 79.0,
        "calculation_method": "navy",
        "waist_cm": 84.0,
        "neck_cm": 38.0,
        "measured_at": (datetime.now() + timedelta(days=7)).isoformat()
    }
    measurement_response_week1 = await client.post(
        "/api/v1/measurements",
        json=measurement_data_week1,
        headers=auth_headers
    )
    assert measurement_response_week1.status_code == 201
    measurement_id_week1 = measurement_response_week1.json()["id"]

    progress_data_week1 = {
        "measurement_id": measurement_id_week1,
        "notes": "Week 1 progress"
    }
    progress_response_week1 = await client.post(
        f"/api/v1/goals/{goal_id}/progress",
        json=progress_data_week1,
        headers=auth_headers
    )
    assert progress_response_week1.status_code == 201
    progress_entries.append(progress_response_week1.json())

    # Week 2 progress
    measurement_data_week2 = {
        "weight_kg": 78.2,
        "calculation_method": "navy",
        "waist_cm": 83.0,
        "neck_cm": 38.0,
        "measured_at": (datetime.now() + timedelta(days=14)).isoformat()
    }
    measurement_response_week2 = await client.post(
        "/api/v1/measurements",
        json=measurement_data_week2,
        headers=auth_headers
    )
    assert measurement_response_week2.status_code == 201
    measurement_id_week2 = measurement_response_week2.json()["id"]

    progress_data_week2 = {
        "measurement_id": measurement_id_week2,
        "notes": "Week 2 progress"
    }
    progress_response_week2 = await client.post(
        f"/api/v1/goals/{goal_id}/progress",
        json=progress_data_week2,
        headers=auth_headers
    )
    assert progress_response_week2.status_code == 201
    progress_entries.append(progress_response_week2.json())

    return {
        "user_id": test_user_with_goal["user_id"],
        "goal_id": goal_id,
        "progress_entries": progress_entries,
        "auth_headers": auth_headers
    }


@pytest.mark.asyncio
class TestBulkingProgressContracts:
    """Contract tests for bulking progress tracking with ceiling warnings."""

    async def test_log_bulking_progress_near_ceiling(self, client: AsyncClient):
        """
        Test bulking progress logging with ceiling warning.

        T065: Contract test for POST /api/v1/goals/{id}/progress with ceiling warning

        Validates:
        - ProgressEntryResponse includes ceiling_warning field
        - Warning triggered when within 1% of ceiling
        - US4 Acceptance #2: Alert when approaching ceiling

        Constitution: Principle III (test-first), Principle I (OpenAPI compliance)
        Functional Requirements: FR-020 (ceiling alerts)
        """
        # Step 1: Register user and login
        from datetime import date

        user_data = {
            "email": "bulking_user@test.com",
            "password": "SecurePass123!",
            "full_name": "Bulking User",
            "date_of_birth": date(1995, 3, 15).isoformat(),
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        register_response = await client.post("/api/v1/users", json=user_data)
        assert register_response.status_code == 201

        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": user_data["email"],
                "password": user_data["password"],
            },
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Step 2: Create initial measurement at ~12% BF
        measurement_data = {
            "weight_kg": 72.0,
            "calculation_method": "navy",
            "waist_cm": 75.0,
            "neck_cm": 40.0,
            "measured_at": datetime.now().isoformat(),
        }

        measurement_response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )
        assert measurement_response.status_code == 201
        initial_measurement = measurement_response.json()

        # Step 4: Create bulking goal with 18% ceiling
        goal_data = {
            "goal_type": "BULKING",
            "initial_measurement_id": initial_measurement["id"],
            "ceiling_body_fat_percentage": 18.0,
        }

        goal_response = await client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()
        goal_id = goal["id"]

        # Step 4: Log progress near ceiling (17.2% - within 1% of 18% ceiling)
        near_ceiling_measurement = {
            "weight_kg": 77.0,  # Gained weight
            "calculation_method": "navy",
            "waist_cm": 83.0,  # Increased waist
            "neck_cm": 40.0,
            "measured_at": (datetime.now() + timedelta(days=7)).isoformat(),
        }

        near_ceiling_response = await client.post(
            "/api/v1/measurements",
            json=near_ceiling_measurement,
            headers=auth_headers,
        )
        assert near_ceiling_response.status_code == 201
        near_ceiling_meas = near_ceiling_response.json()

        # Step 5: Log progress entry
        progress_data = {
            "measurement_id": near_ceiling_meas["id"],
            "notes": "Approaching ceiling target",
        }

        progress_response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=progress_data,
            headers=auth_headers,
        )
        assert progress_response.status_code == 201
        progress = progress_response.json()

        # Verify response schema includes ceiling warning
        assert "ceiling_warning" in progress
        current_bf = near_ceiling_meas["calculated_body_fat_percentage"]

        # If within 1% of ceiling, warning should be present
        if abs(current_bf - 18.0) <= 1.0:
            assert progress["ceiling_warning"] is not None
            assert "ceiling" in progress["ceiling_warning"].lower()
        else:
            assert progress["ceiling_warning"] is None

    async def test_log_bulking_progress_ceiling_reached(self, client: AsyncClient):
        """
        Test bulking goal completion when ceiling reached.

        T066: Contract test for goal completion at ceiling

        Validates:
        - Goal status changes to 'completed' when ceiling reached
        - Alert generated for ceiling reached
        - US4 Acceptance #3: Mark goal complete at ceiling

        Constitution: Principle III (test-first), Principle I (OpenAPI compliance)
        Functional Requirements: FR-013 (goal completion), FR-020 (ceiling alerts)
        """
        # Step 1: Register user and login
        from datetime import date

        user_data = {
            "email": "ceiling_user@test.com",
            "password": "SecurePass123!",
            "full_name": "Ceiling User",
            "date_of_birth": date(1992, 6, 20).isoformat(),
            "gender": "male",
            "height_cm": 178.0,
            "preferred_calculation_method": "navy",
            "activity_level": "lightly_active",
        }

        register_response = await client.post("/api/v1/users", json=user_data)
        assert register_response.status_code == 201

        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": user_data["email"],
                "password": user_data["password"],
            },
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Step 2: Create initial measurement at ~12% BF
        measurement_data = {
            "weight_kg": 70.0,
            "calculation_method": "navy",
            "waist_cm": 74.0,
            "neck_cm": 40.0,
            "measured_at": datetime.now().isoformat(),
        }

        measurement_response = await client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )
        assert measurement_response.status_code == 201
        initial_measurement = measurement_response.json()

        # Step 3: Create bulking goal with 18% ceiling
        goal_data = {
            "goal_type": "bulking",
            "initial_measurement_id": initial_measurement["id"],
            "ceiling_body_fat_percentage": 18.0,
        }

        goal_response = await client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()
        goal_id = goal["id"]
        assert goal["status"] == "ACTIVE"

        # Step 4: Create measurement at ceiling (18% BF)
        # Using measurements that result in ~18% BF
        ceiling_measurement = {
            "weight_kg": 76.0,
            "calculation_method": "navy",
            "waist_cm": 86.0,  # Higher waist for higher BF%
            "neck_cm": 40.0,
            "measured_at": (datetime.now() + timedelta(days=7)).isoformat(),
        }

        ceiling_response = await client.post(
            "/api/v1/measurements",
            json=ceiling_measurement,
            headers=auth_headers,
        )
        assert ceiling_response.status_code == 201
        ceiling_meas = ceiling_response.json()
        ceiling_bf = ceiling_meas["calculated_body_fat_percentage"]

        # Step 5: Log progress at ceiling
        progress_data = {
            "measurement_id": ceiling_meas["id"],
            "notes": "Reached ceiling target",
        }

        progress_response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=progress_data,
            headers=auth_headers,
        )
        assert progress_response.status_code == 201
        progress = progress_response.json()

        # Step 6: Verify goal is marked complete if at/above ceiling
        updated_goal_response = await client.get(
            f"/api/v1/goals/{goal_id}",
            headers=auth_headers,
        )
        assert updated_goal_response.status_code == 200
        updated_goal = updated_goal_response.json()

        # If at or above ceiling, goal should be completed
        if ceiling_bf >= 18.0:
            assert updated_goal["status"] == "COMPLETED"
            assert updated_goal["completed_at"] is not None
            # Should have ceiling warning in progress entry
            assert "ceiling_warning" in progress
            assert progress["ceiling_warning"] is not None
        else:
            # If not yet at ceiling, should still be active
            assert updated_goal["status"] == "ACTIVE"
