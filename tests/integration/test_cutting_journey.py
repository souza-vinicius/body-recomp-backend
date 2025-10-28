"""
Integration tests for complete user journeys.
Tests end-to-end flows across multiple API endpoints.
"""
from fastapi.testclient import TestClient


class TestCuttingGoalJourney:
    """Integration test for complete cutting goal creation journey."""

    def test_create_cutting_goal_journey(self, client: TestClient):
        """
        Test complete journey: Register → Login → Measurement → Goal → Verify.

        Validates:
        - US1 all acceptance scenarios (1-4)
        - End-to-end user journey
        - Data persistence across requests
        - Body fat calculation integration
        - Goal creation with caloric recommendations

        Constitution: Principle III (integration tests before implementation)
        Flow:
        1. Register new user
        2. Login and get token
        3. Create initial measurement (Navy method)
        4. Create cutting goal
        5. Verify goal details
        """
        # Step 1: Register new user
        user_data = {
            "email": "integration.test@example.com",
            "password": "SecurePass123!",
            "full_name": "Integration Test User",
            "date_of_birth": "1990-05-15",
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        register_response = client.post("/api/v1/users", json=user_data)
        assert register_response.status_code == 201, (
            f"Registration failed: {register_response.text}"
        )
        user = register_response.json()
        assert "id" in user

        # Step 2: Login and get token
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"],
        }

        login_response = client.post("/api/v1/auth/login", json=login_data)
        assert login_response.status_code == 200, (
            f"Login failed: {login_response.text}"
        )
        tokens = login_response.json()
        assert "access_token" in tokens

        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Step 3: Create initial measurement (Navy method)
        measurement_data = {
            "weight_kg": 85.0,
            "calculation_method": "navy",
            "waist_cm": 95.0,
            "neck_cm": 38.0,
            "hip_cm": None,  # Not required for men
        }

        measurement_response = client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )
        assert measurement_response.status_code == 201, (
            f"Measurement creation failed: {measurement_response.text}"
        )
        measurement = measurement_response.json()
        assert "id" in measurement
        assert "body_fat_percentage" in measurement
        assert measurement["body_fat_percentage"] is not None
        current_bf = measurement["body_fat_percentage"]

        # Step 4: Create cutting goal
        goal_data = {
            "goal_type": "cutting",
            "target_body_fat_percentage": 12.0,
            "weekly_goal": 0.5,
        }

        goal_response = client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )
        assert goal_response.status_code == 201, (
            f"Goal creation failed: {goal_response.text}"
        )
        goal = goal_response.json()

        # Validate goal data
        assert goal["goal_type"] == "cutting"
        assert goal["target_body_fat_percentage"] == 12.0
        assert goal["current_body_fat_percentage"] == current_bf
        assert goal["status"] == "active"
        assert goal["initial_measurement_id"] == measurement["id"]

        # Validate caloric recommendations
        cal_rec = goal["caloric_recommendations"]
        assert "bmr" in cal_rec
        assert "tdee" in cal_rec
        assert "target_calories" in cal_rec
        assert "caloric_deficit" in cal_rec
        assert "protein_g" in cal_rec

        # Validate caloric deficit is reasonable (300-500 calories)
        assert 300 <= cal_rec["caloric_deficit"] <= 500

        # Validate target_calories = tdee - deficit
        expected_target = cal_rec["tdee"] - cal_rec["caloric_deficit"]
        assert abs(cal_rec["target_calories"] - expected_target) < 1

        # Step 5: Verify goal can be retrieved
        goal_id = goal["id"]
        get_response = client.get(
            f"/api/v1/goals/{goal_id}",
            headers=auth_headers,
        )
        assert get_response.status_code == 200
        retrieved_goal = get_response.json()

        # Validate retrieved goal matches created goal
        assert retrieved_goal["id"] == goal_id
        assert retrieved_goal["goal_type"] == "cutting"
        assert retrieved_goal["target_body_fat_percentage"] == 12.0
        assert "estimated_end_date" in retrieved_goal

    def test_bulking_goal_journey(self, client: TestClient):
        """
        Test complete journey for bulking goal.

        Flow: Register → Login → Measurement → Bulking Goal → Verify
        """
        # Step 1: Register
        user_data = {
            "email": "bulking.test@example.com",
            "password": "SecurePass123!",
            "full_name": "Bulking Test User",
            "date_of_birth": "1995-08-22",
            "gender": "female",
            "height_cm": 165.0,
            "preferred_calculation_method": "3_site",
            "activity_level": "very_active",
        }

        register_response = client.post("/api/v1/users", json=user_data)
        assert register_response.status_code == 201

        # Step 2: Login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"],
        }

        login_response = client.post("/api/v1/auth/login", json=login_data)
        assert login_response.status_code == 200
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Step 3: Create measurement (3-site female)
        measurement_data = {
            "weight_kg": 60.0,
            "calculation_method": "3_site",
            "tricep_mm": 12.0,
            "suprailiac_mm": 10.0,
            "thigh_mm": 15.0,
        }

        measurement_response = client.post(
            "/api/v1/measurements",
            json=measurement_data,
            headers=auth_headers,
        )
        assert measurement_response.status_code == 201
        measurement = measurement_response.json()

        # Step 4: Create bulking goal
        goal_data = {
            "goal_type": "bulking",
            "target_body_fat_percentage": 22.0,
            "weekly_goal": 0.3,
        }

        goal_response = client.post(
            "/api/v1/goals",
            json=goal_data,
            headers=auth_headers,
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()

        assert goal["goal_type"] == "bulking"
        assert goal["status"] == "active"

        # Validate caloric surplus
        cal_rec = goal["caloric_recommendations"]
        assert "caloric_surplus" in cal_rec
        assert cal_rec["caloric_surplus"] >= 200

    def test_cannot_create_duplicate_active_goal(self, client: TestClient):
        """
        Test user cannot create second active goal.

        Validates:
        - FR-018: One active goal per user
        - Proper error handling
        """
        # Setup: Register, login, create measurement and first goal
        user_data = {
            "email": "duplicate.goal@example.com",
            "password": "SecurePass123!",
            "full_name": "Test User",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "height_cm": 180.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        client.post("/api/v1/users", json=user_data)

        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]},
        )
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Create measurement
        measurement_data = {
            "weight_kg": 80.0,
            "calculation_method": "navy",
            "waist_cm": 90.0,
            "neck_cm": 38.0,
        }
        client.post("/api/v1/measurements", json=measurement_data, headers=auth_headers)

        # Create first goal
        goal_data = {
            "goal_type": "cutting",
            "target_body_fat_percentage": 12.0,
            "weekly_goal": 0.5,
        }
        response1 = client.post("/api/v1/goals", json=goal_data, headers=auth_headers)
        assert response1.status_code == 201

        # Attempt to create second goal
        goal_data2 = {
            "goal_type": "bulking",
            "target_body_fat_percentage": 15.0,
            "weekly_goal": 0.3,
        }
        response2 = client.post("/api/v1/goals", json=goal_data2, headers=auth_headers)

        # Should fail
        assert response2.status_code == 400
        data = response2.json()
        assert "active" in data["detail"].lower()

    def test_weekly_progress_tracking_journey(self, client: TestClient):
        """
        Test complete weekly progress tracking journey over 4 weeks.

        Validates:
        - US2 all acceptance scenarios (1-5)
        - Weekly measurement logging after 7+ days
        - Progress calculation and body fat trend
        - Timeline updates based on actual progress
        - Goal completion detection

        Constitution: Principle III (integration tests before implementation)
        Flow:
        1. Register user and create cutting goal
        2. Log progress entry week 1 (after 7 days)
        3. Log progress entry week 2 (after 14 days)
        4. Log progress entry week 3 (after 21 days)
        5. Log progress entry week 4 (after 28 days)
        6. View progress history
        7. View trends analysis
        8. Verify goal completion (if target reached)
        """
        from datetime import datetime, timedelta

        # Setup: Register, login, create measurement and cutting goal
        user_data = {
            "email": "progress.tracker@example.com",
            "password": "SecurePass123!",
            "full_name": "Progress Tracker",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        client.post("/api/v1/users", json=user_data)

        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]},
        )
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Create initial measurement (starting at ~20% body fat)
        initial_measurement = {
            "weight_kg": 80.0,
            "calculation_method": "navy",
            "waist_cm": 90.0,
            "neck_cm": 38.0,
            "measurement_date": datetime.now().isoformat(),
        }
        client.post(
            "/api/v1/measurements",
            json=initial_measurement,
            headers=auth_headers
        )

        # Create cutting goal (target 12% body fat)
        goal_data = {
            "goal_type": "cutting",
            "target_body_fat_percentage": 12.0,
            "weekly_goal": 0.5,
        }
        goal_response = client.post(
            "/api/v1/goals", json=goal_data, headers=auth_headers
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()
        goal_id = goal["id"]

        # Simulate week 1 progress (lost some weight)
        week1_measurement = {
            "weight_kg": 79.0,  # Lost 1kg
            "calculation_method": "navy",
            "waist_cm": 88.5,  # Reduced waist
            "neck_cm": 38.0,
            "measurement_date": (datetime.now() + timedelta(days=7)).isoformat(),
        }
        week1_measurement_response = client.post(
            "/api/v1/measurements",
            json=week1_measurement,
            headers=auth_headers
        )
        week1_measurement_id = week1_measurement_response.json()["id"]

        # Log week 1 progress
        week1_progress = {
            "measurement_id": week1_measurement_id,
            "notes": "Week 1: Good progress, diet compliance high",
        }
        week1_progress_response = client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=week1_progress,
            headers=auth_headers
        )
        assert week1_progress_response.status_code == 201
        week1_data = week1_progress_response.json()
        assert week1_data["week_number"] == 1
        assert week1_data["weight_kg"] == 79.0
        assert week1_data["body_fat_change"] < 0  # Should be negative (loss)
        assert week1_data["weight_change_kg"] == -1.0

        # Simulate week 2 progress
        week2_measurement = {
            "weight_kg": 78.2,  # Lost another 0.8kg
            "calculation_method": "navy",
            "waist_cm": 87.0,
            "neck_cm": 38.0,
            "measurement_date": (datetime.now() + timedelta(days=14)).isoformat(),
        }
        week2_measurement_response = client.post(
            "/api/v1/measurements",
            json=week2_measurement,
            headers=auth_headers
        )
        week2_measurement_id = week2_measurement_response.json()["id"]

        week2_progress = {
            "measurement_id": week2_measurement_id,
            "notes": "Week 2: Steady progress continues",
        }
        week2_progress_response = client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=week2_progress,
            headers=auth_headers
        )
        assert week2_progress_response.status_code == 201
        week2_data = week2_progress_response.json()
        assert week2_data["week_number"] == 2
        assert week2_data["weight_kg"] == 78.2

        # Simulate week 3 progress
        week3_measurement = {
            "weight_kg": 77.5,
            "calculation_method": "navy",
            "waist_cm": 85.5,
            "neck_cm": 38.0,
            "measurement_date": (datetime.now() + timedelta(days=21)).isoformat(),
        }
        week3_measurement_response = client.post(
            "/api/v1/measurements",
            json=week3_measurement,
            headers=auth_headers
        )
        week3_measurement_id = week3_measurement_response.json()["id"]

        week3_progress = {
            "measurement_id": week3_measurement_id,
            "notes": "Week 3: On track",
        }
        week3_progress_response = client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=week3_progress,
            headers=auth_headers
        )
        assert week3_progress_response.status_code == 201

        # Simulate week 4 progress
        week4_measurement = {
            "weight_kg": 76.8,
            "calculation_method": "navy",
            "waist_cm": 84.0,
            "neck_cm": 38.0,
            "measurement_date": (datetime.now() + timedelta(days=28)).isoformat(),
        }
        week4_measurement_response = client.post(
            "/api/v1/measurements",
            json=week4_measurement,
            headers=auth_headers
        )
        week4_measurement_id = week4_measurement_response.json()["id"]

        week4_progress = {
            "measurement_id": week4_measurement_id,
            "notes": "Week 4: Great progress, feeling strong",
        }
        week4_progress_response = client.post(
            f"/api/v1/goals/{goal_id}/progress",
            json=week4_progress,
            headers=auth_headers
        )
        assert week4_progress_response.status_code == 201

        # View progress history
        history_response = client.get(
            f"/api/v1/goals/{goal_id}/progress",
            headers=auth_headers
        )
        assert history_response.status_code == 200
        history = history_response.json()
        assert len(history) == 4  # Should have 4 progress entries
        assert history[0]["week_number"] == 1
        assert history[-1]["week_number"] == 4

        # Verify chronological order
        for i in range(len(history) - 1):
            assert history[i]["week_number"] < history[i + 1]["week_number"]

        # View trends analysis
        trends_response = client.get(
            f"/api/v1/goals/{goal_id}/trends",
            headers=auth_headers
        )
        assert trends_response.status_code == 200
        trends = trends_response.json()

        # Validate trends response schema
        assert "goal_id" in trends
        assert trends["goal_id"] == goal_id
        assert "progress_percentage" in trends
        assert trends["progress_percentage"] > 0  # Should show some progress
        assert "weeks_elapsed" in trends
        assert trends["weeks_elapsed"] == 4
        assert "is_on_track" in trends
        assert "weekly_bf_change_avg" in trends
        assert trends["weekly_bf_change_avg"] < 0  # Negative = fat loss
        assert "weekly_weight_change_avg" in trends
        assert trends["weekly_weight_change_avg"] < 0  # Negative = weight loss
        assert "trend" in trends
        assert trends["trend"] in ["improving", "plateau", "worsening"]
        assert "adjustment_suggestion" in trends
        assert "estimated_weeks_remaining" in trends

        # If progress is good, trend should be 'improving'
        if trends["is_on_track"]:
            assert trends["trend"] == "improving"
            # Should have low or no adjustment suggestion
            if trends["adjustment_suggestion"]:
                assert "maintain" in trends["adjustment_suggestion"].lower()

