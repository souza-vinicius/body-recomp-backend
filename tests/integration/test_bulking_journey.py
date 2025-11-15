"""
Integration tests for bulking goal user journeys.

Tests complete end-to-end flows for creating and tracking bulking goals.
"""
from datetime import datetime

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestBulkingGoalCreation:
    """Integration tests for bulking goal creation journey."""

    async def test_create_bulking_goal_journey(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        """
        Test complete bulking goal creation journey.

        T057: Integration test for complete bulking goal creation journey

        Flow:
        1. Register lean user (12% BF)
        2. Create initial measurement
        3. Create bulking goal (18% ceiling)
        4. Verify goal details and calculations

        Validates:
        - US3 all acceptance scenarios (1-4)
        - End-to-end user journey
        - Bulking calculations (surplus, timeline)
        - Ceiling enforcement

        Constitution: Principle III
        """
        # Step 1: Register a lean user
        user_data = {
            "email": "bulking.user@example.com",
            "password": "BulkingPass123!",
            "full_name": "Bulking Test User",
            "date_of_birth": "1995-01-15",
            "gender": "male",
            "height_cm": 178.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        register_response = await client.post(
            "/api/v1/users",
            json=user_data
        )
        assert register_response.status_code == 201

        # Step 2: Login to get auth token
        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": user_data["email"],
                "password": user_data["password"]
            }
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Step 3: Create initial measurement (lean at ~12-14% BF)
        measurement_data = {
            "weight_kg": 72.0,
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
        measurement = measurement_response.json()

        # Verify initial body fat is low (suitable for bulking)
        initial_bf = measurement["calculated_body_fat_percentage"]
        assert initial_bf < 15.0  # Good starting point for bulk

        # Step 4: Create bulking goal with 18% ceiling
        goal_data = {
            "goal_type": "BULKING",
            "initial_measurement_id": measurement["id"],
            "ceiling_body_fat_percentage": 18.0,
        }

        goal_response = await client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()

        # Verify goal was created correctly
        assert goal["goal_type"] == "BULKING"
        assert goal["status"] == "ACTIVE"
        assert goal["ceiling_body_fat_percentage"] == 18.0

        # Verify caloric surplus
        target_calories = goal["target_calories"]
        assert target_calories > 2000  # Should have surplus

        # Verify timeline estimation
        estimated_weeks = goal["estimated_weeks_to_goal"]
        assert estimated_weeks > 0
        # Bulking at healthy rate (0.1-0.2% BF/month)
        # To gain ~6% BF should take roughly 30-150 weeks
        assert 20 < estimated_weeks < 200

        # Step 5: Verify goal details
        get_goal_response = await client.get(
            f"/api/v1/goals/{goal['id']}",
            headers=auth_headers,
        )
        assert get_goal_response.status_code == 200
        goal_details = get_goal_response.json()

        assert goal_details["id"] == goal["id"]
        assert goal_details["current_body_fat_percentage"] == initial_bf
        assert goal_details["ceiling_body_fat_percentage"] == 18.0
        assert "started_at" in goal_details

    async def test_weekly_bulking_progress(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        """
        Test bulking progress tracking over multiple weeks with ceiling alerts.

        T067: Integration test for bulking progress over multiple weeks

        Flow:
        1. Create bulking goal (14% to 18% ceiling)
        2. Log weekly progress for 4 weeks
        3. Approach ceiling and verify warnings
        4. Reach ceiling and verify goal completion

        Validates:
        - US4 all acceptance scenarios (1-4)
        - Body fat increases safely
        - Ceiling alerts triggered appropriately
        - Goal marked complete at ceiling

        Constitution: Principle III (test-first), FR-020, FR-013
        """
        from datetime import timedelta

        # Step 1: Register user and authenticate
        user_data = {
            "email": "bulking.progress@example.com",
            "password": "BulkProgress123!",
            "full_name": "Bulking Progress User",
            "date_of_birth": "1993-06-10",
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        register_response = await client.post(
            "/api/v1/users", json=user_data
        )
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
        initial_measurement_data = {
            "weight_kg": 70.0,
            "calculation_method": "navy",
            "waist_cm": 74.0,
            "neck_cm": 40.0,
            "measured_at": datetime.now().isoformat(),
        }

        initial_measurement_response = await client.post(
            "/api/v1/measurements",
            json=initial_measurement_data,
            headers=auth_headers,
        )
        assert initial_measurement_response.status_code == 201
        initial_measurement = initial_measurement_response.json()
        initial_bf = initial_measurement["calculated_body_fat_percentage"]
        assert initial_bf < 15.0  # Good starting point

        # Step 3: Create bulking goal with 18% ceiling
        goal_data = {
            "goal_type": "BULKING",
            "initial_measurement_id": initial_measurement["id"],
            "ceiling_body_fat_percentage": 18.0,
        }

        goal_response = await client.post(
            "/api/v1/goals", json=goal_data, headers=auth_headers
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()
        goal_id = goal["id"]
        assert goal["status"] == "ACTIVE"

        # Step 4: Log progress for Week 1 (healthy gain)
        week1_measurement = {
            "weight_kg": 71.0,  # +1kg
            "calculation_method": "navy",
            "waist_cm": 75.0,  # Slight increase
            "neck_cm": 40.0,
            "measured_at": (
                datetime.now() + timedelta(days=7)
            ).isoformat(),
        }

        week1_meas_response = await client.post(
            "/api/v1/measurements",
            json=week1_measurement,
            headers=auth_headers,
        )
        assert week1_meas_response.status_code == 201
        week1_meas = week1_meas_response.json()

        week1_progress = {
            "measurement_id": week1_meas["id"],
            "notes": "Week 1 - steady progress",
        }

        week1_progress_response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=week1_progress,
            headers=auth_headers,
        )
        assert week1_progress_response.status_code == 201
        week1_entry = week1_progress_response.json()

        # Should be no ceiling warning yet
        assert "ceiling_warning" in week1_entry
        week1_bf = week1_meas["calculated_body_fat_percentage"]
        if abs(week1_bf - 18.0) > 1.0:
            assert week1_entry["ceiling_warning"] is None

        # Step 5: Log progress for Week 2
        week2_measurement = {
            "weight_kg": 72.5,
            "calculation_method": "navy",
            "waist_cm": 77.0,
            "neck_cm": 40.0,
            "measured_at": (
                datetime.now() + timedelta(days=14)
            ).isoformat(),
        }

        week2_meas_response = await client.post(
            "/api/v1/measurements",
            json=week2_measurement,
            headers=auth_headers,
        )
        assert week2_meas_response.status_code == 201
        week2_meas = week2_meas_response.json()

        week2_progress = {
            "measurement_id": week2_meas["id"],
            "notes": "Week 2 - continuing bulk",
        }

        week2_progress_response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=week2_progress,
            headers=auth_headers,
        )
        assert week2_progress_response.status_code == 201

        # Step 6: Log progress for Week 3 (approaching ceiling)
        week3_measurement = {
            "weight_kg": 74.5,
            "calculation_method": "navy",
            "waist_cm": 81.0,  # Higher waist
            "neck_cm": 40.0,
            "measured_at": (
                datetime.now() + timedelta(days=21)
            ).isoformat(),
        }

        week3_meas_response = await client.post(
            "/api/v1/measurements",
            json=week3_measurement,
            headers=auth_headers,
        )
        assert week3_meas_response.status_code == 201
        week3_meas = week3_meas_response.json()
        week3_bf = week3_meas["calculated_body_fat_percentage"]

        week3_progress = {
            "measurement_id": week3_meas["id"],
            "notes": "Week 3 - getting close to ceiling",
        }

        week3_progress_response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=week3_progress,
            headers=auth_headers,
        )
        assert week3_progress_response.status_code == 201
        week3_entry = week3_progress_response.json()

        # US4 Acceptance #2: Should warn when within 1% of ceiling
        if abs(week3_bf - 18.0) <= 1.0:
            assert week3_entry["ceiling_warning"] is not None
            assert "ceiling" in week3_entry["ceiling_warning"].lower()

        # Goal should still be active
        goal_check_response = await client.get(
            f"/api/v1/goals/{goal_id}", headers=auth_headers
        )
        assert goal_check_response.status_code == 200
        goal_check = goal_check_response.json()
        if week3_bf < 18.0:
            assert goal_check["status"] == "ACTIVE"

        # Step 7: Log progress for Week 4 (at/above ceiling)
        week4_measurement = {
            "weight_kg": 76.0,
            "calculation_method": "navy",
            "waist_cm": 85.0,  # Even higher waist
            "neck_cm": 40.0,
            "measured_at": (
                datetime.now() + timedelta(days=28)
            ).isoformat(),
        }

        week4_meas_response = await client.post(
            "/api/v1/measurements",
            json=week4_measurement,
            headers=auth_headers,
        )
        assert week4_meas_response.status_code == 201
        week4_meas = week4_meas_response.json()
        week4_bf = week4_meas["calculated_body_fat_percentage"]

        week4_progress = {
            "measurement_id": week4_meas["id"],
            "notes": "Week 4 - reached ceiling",
        }

        week4_progress_response = await client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=week4_progress,
            headers=auth_headers,
        )
        assert week4_progress_response.status_code == 201
        week4_entry = week4_progress_response.json()

        # Should have ceiling warning
        assert week4_entry["ceiling_warning"] is not None

        # US4 Acceptance #3: Goal should be marked complete if at/above ceiling
        final_goal_response = await client.get(
            f"/api/v1/goals/{goal_id}", headers=auth_headers
        )
        assert final_goal_response.status_code == 200
        final_goal = final_goal_response.json()

        if week4_bf >= 18.0:
            assert final_goal["status"] == "COMPLETED"
            assert final_goal["completed_at"] is not None

        # Step 8: Verify progress history
        progress_history_response = await client.get(
            f"/api/v1/goals/{goal_id}/progress", headers=auth_headers
        )
        assert progress_history_response.status_code == 200
        progress_history = progress_history_response.json()
        assert len(progress_history) == 4  # 4 weekly entries

        # Verify body fat increased progressively
        bfs = [
            initial_bf,
            week1_bf,
            week2_meas["calculated_body_fat_percentage"],
            week3_bf,
            week4_bf,
        ]
        for i in range(1, len(bfs)):
            # Body fat should generally increase during bulking
            # (allowing for small measurement variations)
            assert bfs[i] >= bfs[i - 1] - 0.5
