"""Contract tests for Plans API endpoints.

Tests verify API compliance with OpenAPI specification for training and diet plan endpoints.
Following Test-First Development (TFD) principle - written before implementation.
"""

from datetime import datetime
from uuid import uuid4

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestTrainingPlanContracts:
    """Contract tests for training plan endpoints."""

    async def test_get_training_plan_cutting(self, client: AsyncClient):
        """Test GET /api/v1/goals/{goal_id}/training-plan for cutting goal.

        Contract: OpenAPI spec GET /api/v1/goals/{goal_id}/training-plan
        Scenario: User views training plan for cutting goal
        Expected: 200 status, TrainingPlanResponse with strength + cardio
        Constitution: Principle III (contract tests first), Principle I (OpenAPI compliance)
        US5 Acceptance #1: View personalized training plan
        """
        # Step 1: Register user
        user_data = {
            "email": f"test_training_{uuid4()}@example.com",
            "password": "SecurePass123!",
            "full_name": "Test User Training",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "height_cm": 180.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        register_response = await client.post("/api/v1/users", json=user_data)
        assert register_response.status_code == 201

        # Step 2: Login
        login_response = await client.post(
            "/api/v1/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]},
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Step 3: Create measurement at 25% BF
        measurement_data = {
            "weight_kg": 90.0,
            "calculation_method": "navy",
            "waist_cm": 95.0,
            "neck_cm": 38.0,
            "measured_at": datetime.now().isoformat(),
        }

        measurement_response = await client.post(
            "/api/v1/measurements", json=measurement_data, headers=auth_headers
        )
        assert measurement_response.status_code == 201
        measurement = measurement_response.json()

        # Step 4: Create cutting goal
        goal_data = {
            "goal_type": "CUTTING",
            "initial_measurement_id": measurement["id"],
            "target_body_fat_percentage": 15.0,
        }

        goal_response = await client.post(
            "/api/v1/goals", json=goal_data, headers=auth_headers
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()
        goal_id = goal["id"]

        # Step 5: Get training plan
        plan_response = await client.get(
            f"/api/v1/goals/{goal_id}/training-plan", headers=auth_headers
        )

        # Validate contract compliance
        assert plan_response.status_code == 200
        data = plan_response.json()

        # Validate TrainingPlanResponse schema
        assert "id" in data
        assert "goal_id" in data
        assert data["goal_id"] == goal_id
        assert "workout_frequency" in data
        assert isinstance(data["workout_frequency"], int)
        assert data["workout_frequency"] >= 2
        assert "primary_focus" in data
        assert isinstance(data["primary_focus"], str)
        assert "plan_details" in data
        assert isinstance(data["plan_details"], dict)
        assert "created_at" in data

        # Validate cutting-specific content
        plan_details = data["plan_details"]
        assert "strength_training" in plan_details
        assert "cardio" in plan_details

        strength = plan_details["strength_training"]
        assert "frequency" in strength
        assert strength["frequency"] >= 3  # Cutting: 3-4x/week

        cardio = plan_details["cardio"]
        assert "frequency" in cardio
        assert cardio["frequency"] >= 2  # Cutting: 2-3x/week for deficit

    async def test_get_training_plan_bulking(self, client: AsyncClient):
        """Test GET /api/v1/goals/{goal_id}/training-plan for bulking goal.

        Contract: OpenAPI spec GET /api/v1/goals/{goal_id}/training-plan
        Scenario: User views training plan for bulking goal
        Expected: 200 status, TrainingPlanResponse with progressive overload focus
        US5 Acceptance #2: Training plan appropriate for goal type
        """
        # Step 1: Register user
        user_data = {
            "email": f"test_bulking_plan_{uuid4()}@example.com",
            "password": "SecurePass123!",
            "full_name": "Test User Bulking Plan",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "height_cm": 175.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        register_response = await client.post("/api/v1/users", json=user_data)
        assert register_response.status_code == 201

        # Step 2: Login
        login_response = await client.post(
            "/api/v1/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]},
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Step 3: Create measurement at 12% BF (lean)
        measurement_data = {
            "weight_kg": 70.0,
            "calculation_method": "navy",
            "waist_cm": 74.0,
            "neck_cm": 40.0,
            "measured_at": datetime.now().isoformat(),
        }

        measurement_response = await client.post(
            "/api/v1/measurements", json=measurement_data, headers=auth_headers
        )
        assert measurement_response.status_code == 201
        measurement = measurement_response.json()

        # Step 4: Create bulking goal
        goal_data = {
            "goal_type": "BULKING",
            "initial_measurement_id": measurement["id"],
            "ceiling_body_fat_percentage": 18.0,
        }

        goal_response = await client.post(
            "/api/v1/goals", json=goal_data, headers=auth_headers
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()
        goal_id = goal["id"]

        # Step 5: Get training plan
        plan_response = await client.get(
            f"/api/v1/goals/{goal_id}/training-plan", headers=auth_headers
        )

        # Validate contract compliance
        assert plan_response.status_code == 200
        data = plan_response.json()

        # Validate schema
        assert "id" in data
        assert "goal_id" in data
        assert data["goal_id"] == goal_id
        assert "workout_frequency" in data
        assert "primary_focus" in data
        assert "plan_details" in data

        # Validate bulking-specific content
        plan_details = data["plan_details"]
        assert "strength_training" in plan_details

        strength = plan_details["strength_training"]
        assert "frequency" in strength
        assert strength["frequency"] >= 4  # Bulking: 4-6x/week

        # Bulking should have minimal cardio
        if "cardio" in plan_details:
            cardio = plan_details["cardio"]
            assert cardio["frequency"] <= 2  # Bulking: 1-2x/week max

    async def test_get_training_plan_not_found(self, client: AsyncClient):
        """Test GET training plan for non-existent goal returns 404.

        Contract: RESTful error handling
        Expected: 404 Not Found
        """
        # Register and login
        user_data = {
            "email": f"test_404_{uuid4()}@example.com",
            "password": "SecurePass123!",
            "full_name": "Test User",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "height_cm": 180.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        register_response = await client.post("/api/v1/users", json=user_data)
        assert register_response.status_code == 201

        login_response = await client.post(
            "/api/v1/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]},
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Try to get plan for non-existent goal
        fake_goal_id = str(uuid4())
        plan_response = await client.get(
            f"/api/v1/goals/{fake_goal_id}/training-plan", headers=auth_headers
        )

        assert plan_response.status_code == 404


@pytest.mark.asyncio
class TestDietPlanContracts:
    """Contract tests for diet plan endpoints."""

    async def test_get_diet_plan(self, client: AsyncClient):
        """Test GET /api/v1/goals/{goal_id}/diet-plan returns macro breakdown.

        Contract: OpenAPI spec GET /api/v1/goals/{goal_id}/diet-plan
        Scenario: User views diet plan with calorie target and macros
        Expected: 200 status, DietPlanResponse with protein/carbs/fats
        US5 Acceptance #3: View diet plan with macronutrient breakdown
        """
        # Step 1: Register user
        user_data = {
            "email": f"test_diet_{uuid4()}@example.com",
            "password": "SecurePass123!",
            "full_name": "Test User Diet",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "height_cm": 180.0,
            "preferred_calculation_method": "navy",
            "activity_level": "moderately_active",
        }

        register_response = await client.post("/api/v1/users", json=user_data)
        assert register_response.status_code == 201

        # Step 2: Login
        login_response = await client.post(
            "/api/v1/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]},
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Step 3: Create measurement
        measurement_data = {
            "weight_kg": 90.0,
            "calculation_method": "navy",
            "waist_cm": 95.0,
            "neck_cm": 38.0,
            "measured_at": datetime.now().isoformat(),
        }

        measurement_response = await client.post(
            "/api/v1/measurements", json=measurement_data, headers=auth_headers
        )
        assert measurement_response.status_code == 201
        measurement = measurement_response.json()

        # Step 4: Create cutting goal
        goal_data = {
            "goal_type": "CUTTING",
            "initial_measurement_id": measurement["id"],
            "target_body_fat_percentage": 15.0,
        }

        goal_response = await client.post(
            "/api/v1/goals", json=goal_data, headers=auth_headers
        )
        assert goal_response.status_code == 201
        goal = goal_response.json()
        goal_id = goal["id"]

        # Step 5: Get diet plan
        plan_response = await client.get(
            f"/api/v1/goals/{goal_id}/diet-plan", headers=auth_headers
        )

        # Validate contract compliance
        assert plan_response.status_code == 200
        data = plan_response.json()

        # Validate DietPlanResponse schema
        assert "id" in data
        assert "goal_id" in data
        assert data["goal_id"] == goal_id
        assert "daily_calorie_target" in data
        assert isinstance(data["daily_calorie_target"], int)
        assert 1200 <= data["daily_calorie_target"] <= 5000

        assert "protein_grams" in data
        assert isinstance(data["protein_grams"], int)
        assert data["protein_grams"] > 0

        assert "carbs_grams" in data
        assert isinstance(data["carbs_grams"], int)
        assert data["carbs_grams"] > 0

        assert "fat_grams" in data
        assert isinstance(data["fat_grams"], int)
        assert data["fat_grams"] > 0

        assert "guidelines" in data
        assert isinstance(data["guidelines"], str)
        assert "created_at" in data

        # Validate macro math (calories from macros ≈ total calories)
        protein_cals = data["protein_grams"] * 4
        carb_cals = data["carbs_grams"] * 4
        fat_cals = data["fat_grams"] * 9
        total_from_macros = protein_cals + carb_cals + fat_cals

        # Should be within 100 calories
        assert abs(total_from_macros - data["daily_calorie_target"]) <= 100

        # Cutting should have high protein (2.2-2.6g/kg)
        # For 90kg at ~25% BF = ~67.5kg lean mass
        # Expect ~148-175g protein minimum
        assert data["protein_grams"] >= 140
