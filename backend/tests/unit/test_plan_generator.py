"""
Unit tests for PlanGenerator service.

Tests macro calculations, plan generation logic, and diet guidelines.
"""
from decimal import Decimal

from src.models.goal import Goal, GoalStatus, GoalType
from src.models.user import ActivityLevel, Gender, User
from src.schemas.plan import MacronutrientBreakdown
from src.services.plan_generator import PlanGenerator


class TestMacroCalculations:
    """Test macro calculation logic for different goal types."""

    def test_cutting_macros_calculation(self):
        """Test macro breakdown for cutting goal.

        Validates:
        - High protein (2.4g/kg for cutting)
        - Moderate fat (22% of calories)
        - Remaining calories to carbs
        - All macros sum to approximately target calories
        """
        plan_generator = PlanGenerator()

        # Test case: 90kg person, 2400 cal cutting
        macros = plan_generator.calculate_macros(
            calories=2400, goal_type=GoalType.CUTTING, weight_kg=90.0
        )

        # Verify protein (2.4g/kg)
        assert macros.protein_grams == 216  # 90 * 2.4
        assert macros.protein_calories == 864  # 216 * 4

        # Verify fat (approximately 22% of calories)
        expected_fat_calories = int(2400 * 0.22)
        assert abs(macros.fat_calories - expected_fat_calories) <= 20

        # Verify carbs fill remaining calories
        assert macros.carbs_calories > 0

        # Verify total is close to target
        assert abs(macros.total_calories - 2400) <= 100

        # Verify percentages sum to approximately 100%
        total_percentage = (
            macros.protein_percentage
            + macros.carbs_percentage
            + macros.fat_percentage
        )
        assert abs(total_percentage - 100) <= 1

    def test_bulking_macros_calculation(self):
        """Test macro breakdown for bulking goal.

        Validates:
        - Moderate protein (2.0g/kg for bulking)
        - Higher fat (27% of calories)
        - Higher carbs for muscle growth
        """
        plan_generator = PlanGenerator()

        # Test case: 70kg person, 2800 cal bulking
        macros = plan_generator.calculate_macros(
            calories=2800, goal_type=GoalType.BULKING, weight_kg=70.0
        )

        # Verify protein (2.0g/kg)
        assert macros.protein_grams == 140  # 70 * 2.0
        assert macros.protein_calories == 560  # 140 * 4

        # Verify fat (approximately 27% of calories)
        expected_fat_calories = int(2800 * 0.27)
        assert abs(macros.fat_calories - expected_fat_calories) <= 20

        # Verify carbs are substantial (should be largest macro)
        assert macros.carbs_grams > macros.protein_grams
        assert macros.carbs_grams > macros.fat_grams

        # Verify total is close to target
        assert abs(macros.total_calories - 2800) <= 100

    def test_macros_with_decimal_weight(self):
        """Test macro calculation handles Decimal weight correctly.

        Validates:
        - Decimal type is converted to float
        - Calculations work with database Decimal type
        """
        plan_generator = PlanGenerator()

        # Use Decimal (as returned from database)
        weight_decimal = Decimal("85.50")

        macros = plan_generator.calculate_macros(
            calories=2600, goal_type=GoalType.CUTTING, weight_kg=weight_decimal
        )

        # Should work without TypeError
        assert macros.protein_grams > 0
        assert macros.total_calories > 0

        # Verify protein calculation with float conversion
        expected_protein = int(float(weight_decimal) * 2.4)
        assert macros.protein_grams == expected_protein

    def test_macros_minimum_values(self):
        """Test macro calculations with minimum calorie target.

        Validates:
        - Works with minimum 1200 calories
        - All macros are positive
        - Ratios maintained even at low calories
        """
        plan_generator = PlanGenerator()

        macros = plan_generator.calculate_macros(
            calories=1200, goal_type=GoalType.CUTTING, weight_kg=50.0
        )

        # All macros should be positive
        assert macros.protein_grams > 0
        assert macros.carbs_grams > 0
        assert macros.fat_grams > 0

        # Total should be close to 1200
        assert abs(macros.total_calories - 1200) <= 100

    def test_macros_high_calorie_bulking(self):
        """Test macro calculations with high calorie bulking target.

        Validates:
        - Works with 4000+ calories
        - Carbs appropriately high for muscle growth
        - Protein stays moderate (not excessive)
        """
        plan_generator = PlanGenerator()

        macros = plan_generator.calculate_macros(
            calories=4000, goal_type=GoalType.BULKING, weight_kg=90.0
        )

        # Protein moderate (2.0g/kg)
        assert macros.protein_grams == 180  # 90 * 2.0

        # Carbs should be very high
        assert macros.carbs_grams > 400

        # Total close to 4000
        assert abs(macros.total_calories - 4000) <= 100


class TestTrainingPlanGeneration:
    """Test training plan generation for different goal types."""

    def test_cutting_training_plan_structure(self):
        """Test cutting training plan has correct structure.

        Validates:
        - Contains strength_training section
        - Contains cardio section
        - Contains recovery guidelines
        - Appropriate frequency for cutting
        """
        plan_generator = PlanGenerator()

        # Create mock cutting goal
        goal = Goal(
            goal_type=GoalType.CUTTING,
            status=GoalStatus.ACTIVE,
            target_calories=2200,
        )

        plan = plan_generator.generate_training_plan(goal)

        # Verify structure
        assert "strength_training" in plan
        assert "cardio" in plan
        assert "recovery" in plan

        # Verify strength training details
        strength = plan["strength_training"]
        assert strength["frequency"] >= 3
        assert strength["frequency"] <= 4
        assert "exercises" in strength
        assert len(strength["exercises"]) > 0

        # Verify cardio for cutting (should be present)
        cardio = plan["cardio"]
        assert cardio["frequency"] >= 2
        assert cardio["frequency"] <= 3
        assert "activities" in cardio

    def test_bulking_training_plan_structure(self):
        """Test bulking training plan has correct structure.

        Validates:
        - Higher training frequency for muscle growth
        - Minimal cardio
        - Progressive overload focus
        """
        plan_generator = PlanGenerator()

        # Create mock bulking goal
        goal = Goal(
            goal_type=GoalType.BULKING,
            status=GoalStatus.ACTIVE,
            target_calories=2800,
        )

        plan = plan_generator.generate_training_plan(goal)

        # Verify structure
        assert "strength_training" in plan
        assert "cardio" in plan

        # Verify higher strength frequency for bulking
        strength = plan["strength_training"]
        assert strength["frequency"] >= 4
        assert strength["frequency"] <= 6
        assert "progression" in strength
        assert "overload" in strength["progression"].lower()

        # Verify minimal cardio
        cardio = plan["cardio"]
        assert cardio["frequency"] <= 2

    def test_cutting_vs_bulking_training_differences(self):
        """Test that cutting and bulking plans differ appropriately.

        Validates:
        - Bulking has more strength sessions
        - Cutting has more cardio sessions
        - Different progression strategies
        """
        plan_generator = PlanGenerator()

        cutting_goal = Goal(
            goal_type=GoalType.CUTTING,
            status=GoalStatus.ACTIVE,
            target_calories=2200,
        )

        bulking_goal = Goal(
            goal_type=GoalType.BULKING,
            status=GoalStatus.ACTIVE,
            target_calories=2800,
        )

        cutting_plan = plan_generator.generate_training_plan(cutting_goal)
        bulking_plan = plan_generator.generate_training_plan(bulking_goal)

        # Bulking should have more strength training
        assert (
            bulking_plan["strength_training"]["frequency"]
            > cutting_plan["strength_training"]["frequency"]
        )

        # Cutting should have more cardio
        assert (
            cutting_plan["cardio"]["frequency"]
            > bulking_plan["cardio"]["frequency"]
        )


class TestDietPlanGeneration:
    """Test diet plan generation and guidelines."""

    def test_diet_plan_structure(self):
        """Test diet plan has all required fields.

        Validates:
        - Calorie target matches goal
        - Contains macro breakdown
        - Includes meal timing
        - Has guidelines
        """
        plan_generator = PlanGenerator()

        # Create mock goal and user
        goal = Goal(
            goal_type=GoalType.CUTTING,
            status=GoalStatus.ACTIVE,
            target_calories=2400,
            initial_weight_kg=Decimal("90.0"),
        )

        user = User(
            email="test@example.com",
            full_name="Test User",
            gender=Gender.MALE,
            height_cm=Decimal("180.0"),
            activity_level=ActivityLevel.MODERATELY_ACTIVE,
        )

        diet_plan = plan_generator.generate_diet_plan(goal, user, 90.0)

        # Verify structure
        assert "daily_calorie_target" in diet_plan
        assert "protein_grams" in diet_plan
        assert "carbs_grams" in diet_plan
        assert "fat_grams" in diet_plan
        assert "meal_timing" in diet_plan
        assert "guidelines" in diet_plan

        # Verify calorie target matches
        assert diet_plan["daily_calorie_target"] == 2400

    def test_diet_plan_uses_latest_weight(self):
        """Test diet plan uses latest weight for calculations.

        Validates:
        - Latest weight parameter is used over goal start weight
        - Macros calculated based on current weight
        """
        plan_generator = PlanGenerator()

        goal = Goal(
            goal_type=GoalType.CUTTING,
            status=GoalStatus.ACTIVE,
            target_calories=2400,
            initial_weight_kg=Decimal("90.0"),  # Initial weight
        )

        user = User(
            email="test@example.com",
            full_name="Test User",
            gender=Gender.MALE,
            height_cm=Decimal("180.0"),
            activity_level=ActivityLevel.MODERATELY_ACTIVE,
        )

        # User has lost weight
        latest_weight = 85.0

        diet_plan = plan_generator.generate_diet_plan(
            goal, user, latest_weight
        )

        # Protein should be based on 85kg, not 90kg
        # Cutting: 2.4g/kg
        expected_protein = int(85.0 * 2.4)
        assert diet_plan["protein_grams"] == expected_protein

    def test_diet_plan_falls_back_to_start_weight(self):
        """Test diet plan uses start weight if no latest weight provided.

        Validates:
        - Falls back to goal.initial_weight_kg when latest_weight is None
        """
        plan_generator = PlanGenerator()

        goal = Goal(
            goal_type=GoalType.CUTTING,
            status=GoalStatus.ACTIVE,
            target_calories=2400,
            initial_weight_kg=Decimal("90.0"),
        )

        user = User(
            email="test@example.com",
            full_name="Test User",
            gender=Gender.MALE,
            height_cm=Decimal("180.0"),
            activity_level=ActivityLevel.MODERATELY_ACTIVE,
        )

        # No latest weight provided
        diet_plan = plan_generator.generate_diet_plan(goal, user, None)

        # Should use start weight (90kg)
        expected_protein = int(90.0 * 2.4)
        assert diet_plan["protein_grams"] == expected_protein

    def test_cutting_diet_guidelines_content(self):
        """Test cutting diet guidelines include key information.

        Validates:
        - Contains macro targets
        - Mentions protein priority
        - Includes hydration guidance
        - Has meal timing recommendations
        """
        plan_generator = PlanGenerator()

        macros = MacronutrientBreakdown(
            protein_grams=200,
            protein_calories=800,
            protein_percentage=33.3,
            carbs_grams=250,
            carbs_calories=1000,
            carbs_percentage=41.7,
            fat_grams=67,
            fat_calories=600,
            fat_percentage=25.0,
            total_calories=2400,
        )

        guidelines = plan_generator._generate_cutting_diet_guidelines(macros)

        # Should contain key information
        assert "200" in guidelines  # protein grams
        assert "250" in guidelines  # carbs grams
        assert "67" in guidelines  # fat grams
        assert "2400" in guidelines  # total calories
        assert "protein" in guidelines.lower()
        assert "hydration" in guidelines.lower() or "water" in guidelines.lower()

    def test_bulking_diet_guidelines_content(self):
        """Test bulking diet guidelines include key information.

        Validates:
        - Contains macro targets
        - Emphasizes calorie surplus
        - Includes meal frequency guidance
        - Mentions progressive nutrition
        """
        plan_generator = PlanGenerator()

        macros = MacronutrientBreakdown(
            protein_grams=160,
            protein_calories=640,
            protein_percentage=22.9,
            carbs_grams=450,
            carbs_calories=1800,
            carbs_percentage=64.3,
            fat_grams=84,
            fat_calories=756,
            fat_percentage=27.0,
            total_calories=2800,
        )

        guidelines = plan_generator._generate_bulking_diet_guidelines(macros)

        # Should contain key information
        assert "160" in guidelines  # protein grams
        assert "450" in guidelines  # carbs grams
        assert "84" in guidelines  # fat grams
        assert "2800" in guidelines  # total calories
        assert "carb" in guidelines.lower()

    def test_meal_timing_cutting_vs_bulking(self):
        """Test meal timing differs for cutting vs bulking.

        Validates:
        - Bulking recommends more frequent meals
        - Different pre/post workout recommendations
        - Timing strategies match goal type
        """
        plan_generator = PlanGenerator()

        cutting_timing = plan_generator._generate_meal_timing(
            GoalType.CUTTING
        )
        bulking_timing = plan_generator._generate_meal_timing(GoalType.BULKING)

        # Verify structure
        assert "meals_per_day" in cutting_timing
        assert "meals_per_day" in bulking_timing
        assert "pre_workout" in cutting_timing
        assert "post_workout" in cutting_timing

        # Bulking should suggest more frequent meals
        # Parse meal frequency (e.g., "3-4" -> compare first number)
        cutting_meals = int(cutting_timing["meals_per_day"].split("-")[0])
        bulking_meals = int(bulking_timing["meals_per_day"].split("-")[0])
        assert bulking_meals >= cutting_meals
