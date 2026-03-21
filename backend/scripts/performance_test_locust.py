"""
Performance Testing Script for T122 using Locust
Tests 100 concurrent users creating goals and logging progress
Target: <200ms p95 response time

Usage:
    pip install locust
    locust -f scripts/performance_test_locust.py --host=http://localhost:8000

Then open http://localhost:8089 to configure the test:
    - Number of users: 100
    - Spawn rate: 10 users/second
"""

import random
import time
from datetime import datetime, timedelta

from locust import HttpUser, between, task


class BodyRecompUser(HttpUser):
    """Simulates a user creating goals and logging progress"""

    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks

    def on_start(self):
        """Called when a simulated user starts. Sets up authentication."""
        # Generate unique email for this test user
        timestamp = int(time.time() * 1000)
        random_suffix = random.randint(1000, 9999)
        self.email = f"loadtest{timestamp}{random_suffix}@example.com"
        self.password = "TestPassword123!"

        # Register user
        response = self.client.post("/api/v1/users", json={
            "email": self.email,
            "password": self.password,
            "full_name": "Load Test User",
            "date_of_birth": "1990-01-01",
            "gender": random.choice(["male", "female"]),
            "height_cm": random.uniform(160.0, 190.0),
            "preferred_calculation_method": "navy",
            "activity_level": random.choice([
                "sedentary",
                "lightly_active",
                "moderately_active",
                "very_active",
                "extra_active"
            ])
        }, name="Register User")

        if response.status_code == 201:
            self.user_id = response.json()["id"]
        else:
            self.environment.runner.quit()
            return

        # Login to get access token
        response = self.client.post("/api/v1/auth/login", json={
            "email": self.email,
            "password": self.password
        }, name="Login")

        if response.status_code == 200:
            self.access_token = response.json()["access_token"]
            self.headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
        else:
            self.environment.runner.quit()
            return

        # Create initial measurement
        self.create_measurement()

        # Create initial goal
        self.create_goal()

    def create_measurement(self, days_offset=0):
        """Create a body measurement"""
        measured_at = datetime.utcnow() + timedelta(days=days_offset)

        response = self.client.post("/api/v1/measurements", json={
            "weight_kg": random.uniform(60.0, 100.0),
            "calculation_method": "navy",
            "waist_cm": random.uniform(70.0, 110.0),
            "neck_cm": random.uniform(32.0, 42.0),
            "measured_at": measured_at.isoformat() + "Z"
        }, headers=self.headers, name="Create Measurement")

        if response.status_code == 201:
            return response.json()["id"]
        return None

    def create_goal(self):
        """Create a fitness goal (cutting or bulking)"""
        # Create initial measurement
        measurement_id = self.create_measurement()
        if not measurement_id:
            return

        # Randomly choose goal type
        goal_type = random.choice(["cutting", "bulking"])

        goal_payload = {
            "goal_type": goal_type,
            "initial_measurement_id": measurement_id
        }

        if goal_type == "cutting":
            goal_payload["target_body_fat_percentage"] = random.uniform(10.0, 15.0)
        else:
            goal_payload["ceiling_body_fat_percentage"] = random.uniform(18.0, 25.0)

        response = self.client.post("/api/v1/goals", json=goal_payload,
                                   headers=self.headers, name="Create Goal")

        if response.status_code == 201:
            self.goal_id = response.json()["id"]
        else:
            self.goal_id = None

    @task(3)
    def log_progress(self):
        """Log weekly progress (higher weight = more frequent)"""
        if not hasattr(self, 'goal_id') or not self.goal_id:
            return

        # Create a new measurement (simulating a week later)
        measurement_id = self.create_measurement(days_offset=7)
        if not measurement_id:
            return

        # Create progress entry
        self.client.post(
            f"/api/v1/goals/{self.goal_id}/progress",
            json={"measurement_id": measurement_id},
            headers=self.headers,
            name="Log Progress"
        )

    @task(2)
    def view_progress_history(self):
        """View progress history"""
        if not hasattr(self, 'goal_id') or not self.goal_id:
            return

        self.client.get(
            f"/api/v1/goals/{self.goal_id}/progress",
            headers=self.headers,
            name="View Progress History"
        )

    @task(1)
    def view_trends(self):
        """View trend analysis"""
        if not hasattr(self, 'goal_id') or not self.goal_id:
            return

        self.client.get(
            f"/api/v1/goals/{self.goal_id}/trends",
            headers=self.headers,
            name="View Trends",
            catch_response=True
        )

    @task(2)
    def get_training_plan(self):
        """Get training plan"""
        if not hasattr(self, 'goal_id') or not self.goal_id:
            return

        self.client.get(
            f"/api/v1/goals/{self.goal_id}/training-plan",
            headers=self.headers,
            name="Get Training Plan"
        )

    @task(2)
    def get_diet_plan(self):
        """Get diet plan"""
        if not hasattr(self, 'goal_id') or not self.goal_id:
            return

        response = self.client.get(
            f"/api/v1/goals/{self.goal_id}/diet-plan",
            headers=self.headers,
            name="Get Diet Plan"
        )

        # Validate response
        if response.status_code == 200:
            data = response.json()
            if "daily_calorie_target" not in data:
                response.failure("Missing daily_calorie_target in response")

    @task(1)
    def list_goals(self):
        """List user's goals"""
        self.client.get(
            "/api/v1/goals",
            headers=self.headers,
            name="List Goals"
        )

    @task(1)
    def list_measurements(self):
        """List user's measurements"""
        self.client.get(
            "/api/v1/measurements?limit=10",
            headers=self.headers,
            name="List Measurements"
        )


class AdminUser(HttpUser):
    """Simulates an admin performing health checks and monitoring"""

    wait_time = between(5, 10)  # Check less frequently
    weight = 1  # Lower weight = less frequent spawning

    @task
    def health_check(self):
        """Check API health"""
        self.client.get("/health", name="Health Check")

    @task
    def openapi_spec(self):
        """Get OpenAPI specification"""
        self.client.get("/openapi.json", name="OpenAPI Spec")


if __name__ == "__main__":
    import subprocess

    # Run Locust from command line
    print("Starting Locust performance test...")
    print("Open http://localhost:8089 to configure and start the test")
    print("\nRecommended settings:")
    print("  - Number of users: 100")
    print("  - Spawn rate: 10 users/second")
    print("  - Host: http://localhost:8000")

    subprocess.run([
        "locust",
        "-f", __file__,
        "--host=http://localhost:8000",
        "--web-port=8089"
    ])
