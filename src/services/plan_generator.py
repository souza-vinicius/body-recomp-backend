"""
Service for generating personalized training and diet plans.
"""

from src.models.goal import Goal, GoalType
from src.models.user import User
from src.schemas.plan import MacronutrientBreakdown


class PlanGenerator:
    """Generate personalized training and diet plans based on goals."""

    def generate_training_plan(self, goal: Goal) -> dict:
        """
        Generate a training plan based on goal type.

        Cutting: 3-4 strength training sessions + 2-3 cardio sessions per week
        Bulking: 4-6 strength training sessions + minimal cardio per week

        Args:
            goal: The user's goal

        Returns:
            Dictionary containing training plan details
        """
        if goal.goal_type == GoalType.CUTTING:
            return self._generate_cutting_training_plan()
        else:  # BULKING
            return self._generate_bulking_training_plan()

    def _generate_cutting_training_plan(self) -> dict:
        """Generate training plan optimized for fat loss."""
        return {
            "strength_training": {
                "frequency": 3,
                "description": "3-4 sessions per week focusing on compound movements",
                "exercises": [
                    {
                        "name": "Squats",
                        "sets": "3-4",
                        "reps": "6-8",
                        "rest": "2-3 min",
                    },
                    {
                        "name": "Deadlifts",
                        "sets": "3",
                        "reps": "5-6",
                        "rest": "3 min",
                    },
                    {
                        "name": "Bench Press",
                        "sets": "3-4",
                        "reps": "6-8",
                        "rest": "2-3 min",
                    },
                    {
                        "name": "Overhead Press",
                        "sets": "3",
                        "reps": "6-8",
                        "rest": "2 min",
                    },
                    {
                        "name": "Barbell Rows",
                        "sets": "3-4",
                        "reps": "6-8",
                        "rest": "2 min",
                    },
                ],
                "progression": "Maintain or slightly increase strength. Focus on keeping weight on the bar during deficit.",
                "notes": "Prioritize compound movements. Reduce volume if recovery is impaired.",
            },
            "cardio": {
                "frequency": 2,
                "description": "2-3 sessions per week for additional calorie expenditure",
                "activities": [
                    {
                        "type": "LISS (Low Intensity Steady State)",
                        "duration": "30-45 minutes",
                        "intensity": "Zone 2 (conversational pace)",
                        "examples": "Walking, cycling, swimming",
                    },
                    {
                        "type": "HIIT (High Intensity Interval Training)",
                        "duration": "15-20 minutes",
                        "intensity": "Alternating high/low intensity",
                        "examples": "Sprints, bike intervals, rowing",
                    },
                ],
                "notes": "Start with 2 sessions, increase to 3 if fat loss stalls. Do cardio on separate days or after strength training.",
            },
            "recovery": {
                "rest_days": 2,
                "sleep_target": "7-9 hours",
                "notes": "Adequate recovery is crucial during a calorie deficit.",
            },
        }

    def _generate_bulking_training_plan(self) -> dict:
        """Generate training plan optimized for muscle growth."""
        return {
            "strength_training": {
                "frequency": 5,
                "description": "4-6 sessions per week with progressive overload",
                "exercises": [
                    {
                        "name": "Squats",
                        "sets": "4-5",
                        "reps": "6-10",
                        "rest": "2-3 min",
                    },
                    {
                        "name": "Deadlifts",
                        "sets": "3-4",
                        "reps": "5-8",
                        "rest": "3-4 min",
                    },
                    {
                        "name": "Bench Press",
                        "sets": "4-5",
                        "reps": "6-10",
                        "rest": "2-3 min",
                    },
                    {
                        "name": "Overhead Press",
                        "sets": "3-4",
                        "reps": "6-10",
                        "rest": "2-3 min",
                    },
                    {
                        "name": "Barbell Rows",
                        "sets": "4",
                        "reps": "6-10",
                        "rest": "2-3 min",
                    },
                    {
                        "name": "Pull-ups/Lat Pulldowns",
                        "sets": "3-4",
                        "reps": "8-12",
                        "rest": "2 min",
                    },
                    {
                        "name": "Dips",
                        "sets": "3",
                        "reps": "8-12",
                        "rest": "2 min",
                    },
                ],
                "progression": "Progressive overload - increase weight by 2.5-5% when you can complete all sets with good form.",
                "notes": "Focus on increasing strength and volume over time. Add 1-2 isolation exercises per muscle group.",
            },
            "cardio": {
                "frequency": 1,
                "description": "Minimal cardio to preserve energy for muscle growth",
                "activities": [
                    {
                        "type": "LISS (Low Intensity Steady State)",
                        "duration": "20-30 minutes",
                        "intensity": "Zone 2 (easy pace)",
                        "examples": "Walking, light cycling",
                    },
                ],
                "notes": "Keep cardio minimal. Used primarily for cardiovascular health, not calorie burning.",
            },
            "recovery": {
                "rest_days": 1,
                "sleep_target": "8-9 hours",
                "notes": "Maximize recovery to support muscle growth. Consider deload weeks every 4-6 weeks.",
            },
        }

    def generate_diet_plan(
        self, goal: Goal, user: User, latest_weight_kg: float | None = None
    ) -> dict:
        """
        Generate a diet plan with macro calculations.

        Args:
            goal: The user's goal
            user: The user
            latest_weight_kg: Latest recorded weight in kg (optional)

        Returns:
            Dictionary containing diet plan details with macros
        """
        # Use latest weight if available, otherwise use goal's initial weight
        weight_kg = (
            latest_weight_kg
            if latest_weight_kg is not None
            else goal.initial_weight_kg
        )

        # Calculate macros based on goal type
        macros = self.calculate_macros(
            calories=goal.target_calories, goal_type=goal.goal_type, weight_kg=weight_kg
        )

        if goal.goal_type == GoalType.CUTTING:
            guidelines = self._generate_cutting_diet_guidelines(macros)
        else:  # BULKING
            guidelines = self._generate_bulking_diet_guidelines(macros)

        return {
            "daily_calorie_target": goal.target_calories,
            "protein_grams": macros.protein_grams,
            "carbs_grams": macros.carbs_grams,
            "fat_grams": macros.fat_grams,
            "meal_timing": self._generate_meal_timing(goal.goal_type),
            "guidelines": guidelines,
        }

    def calculate_macros(
        self, calories: int, goal_type: GoalType, weight_kg: float
    ) -> MacronutrientBreakdown:
        """
        Calculate macronutrient breakdown based on goals.

        Cutting: High protein (2.2-2.6g/kg), moderate fat (20-25%), rest carbs
        Bulking: Moderate protein (1.8-2.2g/kg), moderate fat (25-30%), rest carbs

        Args:
            calories: Daily calorie target
            goal_type: CUTTING or BULKING
            weight_kg: Current body weight in kg

        Returns:
            MacronutrientBreakdown with grams, calories, and percentages
        """
        if goal_type == GoalType.CUTTING:
            # Cutting: Higher protein to preserve muscle
            protein_grams = int(
                float(weight_kg) * 2.4
            )  # 2.4g/kg (middle of 2.2-2.6 range)
            fat_percentage = 0.22  # 22% (middle of 20-25% range)
        else:  # BULKING
            # Bulking: Moderate protein, higher carbs for growth
            protein_grams = int(
                float(weight_kg) * 2.0
            )  # 2.0g/kg (middle of 1.8-2.2 range)
            fat_percentage = 0.27  # 27% (middle of 25-30% range)

        # Calculate fat grams from percentage of total calories
        protein_calories = protein_grams * 4
        fat_calories = int(calories * fat_percentage)
        fat_grams = int(fat_calories / 9)

        # Remaining calories go to carbs
        carbs_calories = calories - protein_calories - fat_calories
        carbs_grams = int(carbs_calories / 4)

        # Calculate actual percentages
        total_calories = protein_calories + (fat_grams * 9) + (carbs_grams * 4)
        protein_percentage = round((protein_calories / total_calories) * 100, 1)
        fat_percentage_actual = round(((fat_grams * 9) / total_calories) * 100, 1)
        carbs_percentage = round(((carbs_grams * 4) / total_calories) * 100, 1)

        return MacronutrientBreakdown(
            protein_grams=protein_grams,
            protein_calories=protein_calories,
            protein_percentage=protein_percentage,
            carbs_grams=carbs_grams,
            carbs_calories=carbs_grams * 4,
            carbs_percentage=carbs_percentage,
            fat_grams=fat_grams,
            fat_calories=fat_grams * 9,
            fat_percentage=fat_percentage_actual,
            total_calories=total_calories,
        )

    def _generate_cutting_diet_guidelines(self, macros: MacronutrientBreakdown) -> str:
        """Generate diet guidelines for cutting phase."""
        return f"""
**Cutting Diet Guidelines**

**Daily Targets:**
- Calories: {macros.total_calories} kcal
- Protein: {macros.protein_grams}g ({macros.protein_percentage}%)
- Carbohydrates: {macros.carbs_grams}g ({macros.carbs_percentage}%)
- Fat: {macros.fat_grams}g ({macros.fat_percentage}%)

**Protein Sources (High Priority):**
- Lean meats: chicken breast, turkey, lean beef
- Fish: salmon, tuna, white fish
- Eggs and egg whites
- Greek yogurt, cottage cheese
- Protein powder (whey, casein)

**Carbohydrate Timing:**
- Focus carbs around training sessions
- Pre-workout: 30-45 min before (30-40g carbs)
- Post-workout: Within 1-2 hours (40-60g carbs)
- Prioritize complex carbs: oats, rice, potatoes, quinoa

**Fat Sources:**
- Healthy fats: avocado, nuts, olive oil, fatty fish
- Distribute throughout the day
- Minimum 20% of calories to support hormones

**Hydration:**
- Aim for 3-4 liters of water per day
- More if training intensely or in hot conditions

**Supplements to Consider:**
- Protein powder (convenience)
- Creatine monohydrate (5g/day)
- Caffeine (pre-workout energy)
- Multivitamin (nutritional insurance)

**Tips:**
- Track food intake consistently
- Meal prep to stay on target
- High-volume, low-calorie vegetables for satiety
- Save 10-20% calories for flexible foods (adherence)
- Adjust based on weekly weigh-ins and progress photos
        """.strip()

    def _generate_bulking_diet_guidelines(self, macros: MacronutrientBreakdown) -> str:
        """Generate diet guidelines for bulking phase."""
        return f"""
**Bulking Diet Guidelines**

**Daily Targets:**
- Calories: {macros.total_calories} kcal
- Protein: {macros.protein_grams}g ({macros.protein_percentage}%)
- Carbohydrates: {macros.carbs_grams}g ({macros.carbs_percentage}%)
- Fat: {macros.fat_grams}g ({macros.fat_percentage}%)

**Protein Sources:**
- Lean and fattier cuts: chicken, beef, pork, lamb
- Fish: salmon, tuna, white fish
- Whole eggs
- Dairy: Greek yogurt, cottage cheese, milk
- Protein powder for convenience

**Carbohydrate Focus:**
- Higher carbs support training and recovery
- Pre-workout: 45-60 min before (50-70g carbs)
- Post-workout: Within 1-2 hours (60-90g carbs)
- Variety: oats, rice, pasta, potatoes, bread, fruits

**Fat Sources:**
- Include calorie-dense healthy fats
- Nuts, nut butters, avocado, olive oil, coconut oil
- Fatty fish (omega-3s)
- Whole eggs, full-fat dairy

**Meal Frequency:**
- 3-5 meals per day for easier calorie intake
- Don't force-feed, but eat consistently
- Liquid calories can help (smoothies, milk)

**Hydration:**
- 3-4 liters of water per day
- Especially important with higher carb intake

**Supplements to Consider:**
- Protein powder (convenience)
- Creatine monohydrate (5g/day)
- Carb powder (intra/post-workout)
- Multivitamin

**Tips:**
- Track intake to ensure hitting calorie target
- Don't "dirty bulk" - keep food quality high
- Monitor weekly weight gain (0.25-0.5% bodyweight/week)
- Adjust calories up if weight gain stalls
- Include fiber-rich foods for digestion
- Allow flexibility for enjoyable foods
        """.strip()

    def _generate_meal_timing(self, goal_type: GoalType) -> dict:
        """Generate recommended meal timing suggestions."""
        if goal_type == GoalType.CUTTING:
            return {
                "meals_per_day": "3-4",
                "pre_workout": {
                    "timing": "30-45 minutes before",
                    "macros": "30-40g carbs, 20-30g protein, low fat",
                    "examples": "Oats with whey protein, rice cakes with banana and protein",
                },
                "post_workout": {
                    "timing": "Within 1-2 hours after",
                    "macros": "40-60g carbs, 30-40g protein",
                    "examples": "Chicken with rice, protein shake with fruit",
                },
                "notes": "Space meals 3-4 hours apart. Include vegetables for volume and satiety.",
            }
        else:  # BULKING
            return {
                "meals_per_day": "4-5",
                "pre_workout": {
                    "timing": "45-60 minutes before",
                    "macros": "50-70g carbs, 25-35g protein, low fat",
                    "examples": "Rice with chicken, oats with protein and banana",
                },
                "post_workout": {
                    "timing": "Within 1-2 hours after",
                    "macros": "60-90g carbs, 35-45g protein",
                    "examples": "Rice and chicken, pasta with lean beef, protein shake with carbs",
                },
                "notes": "Frequent meals make hitting calorie target easier. Include calorie-dense foods.",
            }
