"""
Goal service for Body Recomp Backend.

Handles business logic for creating and managing body recomposition goals.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.goal import Goal
from src.models.user import User
from src.models.measurement import BodyMeasurement
from src.models.enums import GoalType, GoalStatus, Gender, ActivityLevel
from src.schemas.goal import GoalCreate


class GoalService:
    """Service for managing body recomposition goals."""

    @staticmethod
    def calculate_bmr(
        weight_kg: Decimal,
        height_cm: Decimal,
        age_years: int,
        gender: Gender,
    ) -> int:
        """
        Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.
        
        Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
        Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
        
        Returns BMR rounded to nearest integer calorie.
        """
        bmr = (
            10 * float(weight_kg)
            + 6.25 * float(height_cm)
            - 5 * age_years
        )
        
        if gender == Gender.MALE:
            bmr += 5
        else:  # Gender.FEMALE
            bmr -= 161
        
        return round(bmr)

    @staticmethod
    def calculate_tdee(bmr: int, activity_level: ActivityLevel) -> int:
        """
        Calculate Total Daily Energy Expenditure.
        
        Applies activity multiplier to BMR:
        - Sedentary: BMR × 1.2
        - Lightly active: BMR × 1.375
        - Moderately active: BMR × 1.55
        - Very active: BMR × 1.725
        - Extremely active: BMR × 1.9
        
        Returns TDEE rounded to nearest integer calorie.
        """
        multipliers = {
            ActivityLevel.SEDENTARY: 1.2,
            ActivityLevel.LIGHTLY_ACTIVE: 1.375,
            ActivityLevel.MODERATELY_ACTIVE: 1.55,
            ActivityLevel.VERY_ACTIVE: 1.725,
            ActivityLevel.EXTREMELY_ACTIVE: 1.9,
        }
        
        tdee = bmr * multipliers[activity_level]
        return round(tdee)

    @staticmethod
    def calculate_cutting_calories(
        tdee: int,
        gender: Gender,
        deficit: int = 400,
    ) -> int:
        """
        Calculate target calories for cutting goal.
        
        Applies 300-500 calorie deficit (default 400).
        Enforces minimum safe limits:
        - Men: 1500 cal/day minimum
        - Women: 1200 cal/day minimum
        
        Returns target calories rounded to nearest integer.
        """
        target = tdee - deficit
        
        # Enforce minimum safe limits
        minimum = 1500 if gender == Gender.MALE else 1200
        
        return max(target, minimum)

    @staticmethod
    def calculate_bulking_calories(tdee: int, surplus: int = 250) -> int:
        """
        Calculate target calories for bulking goal.
        
        Applies 200-300 calorie surplus (default 250).
        Conservative surplus minimizes fat gain.
        
        Returns target calories rounded to nearest integer.
        """
        return tdee + surplus

    @staticmethod
    def estimate_cutting_timeline(
        current_bf: Decimal,
        target_bf: Decimal,
        rate_per_month: float = 0.75,
    ) -> int:
        """
        Estimate weeks to reach cutting goal.
        
        Uses evidence-based rate of 0.5-1% body fat decrease per month.
        Default: 0.75% per month (conservative middle ground).
        
        Formula: weeks = (current - target) / (rate / 4.33 weeks/month)
        
        Returns estimated weeks, rounded to nearest integer.
        """
        bf_difference = float(current_bf - target_bf)
        rate_per_week = rate_per_month / 4.33
        weeks = bf_difference / rate_per_week
        return round(weeks)

    @staticmethod
    def estimate_bulking_timeline(
        current_bf: Decimal,
        ceiling_bf: Decimal,
        rate_per_month: float = 0.2,
    ) -> int:
        """
        Estimate weeks to reach bulking ceiling.
        
        Uses conservative rate of 0.1-0.3% body fat increase per month.
        Default: 0.2% per month.
        
        Formula: weeks = (ceiling - current) / (rate / 4.33 weeks/month)
        
        Returns estimated weeks, rounded to nearest integer.
        """
        bf_difference = float(ceiling_bf - current_bf)
        rate_per_week = rate_per_month / 4.33
        weeks = bf_difference / rate_per_week
        return round(weeks)

    @staticmethod
    async def validate_goal_safety(
        goal_type: GoalType,
        current_bf: Decimal,
        target_bf: Optional[Decimal],
        ceiling_bf: Optional[Decimal],
        gender: Gender,
    ) -> None:
        """
        Validate goal meets safety requirements (FR-017).
        
        Cutting goals:
        - Target must be >= 8% (men) or >= 15% (women)
        - Target must be < current body fat
        
        Bulking goals:
        - Ceiling must be <= 30%
        - Ceiling must be > current body fat
        
        Raises ValueError if unsafe.
        """
        if goal_type == GoalType.CUTTING:
            if target_bf is None:
                raise ValueError(
                    "target_body_fat_percentage required for cutting goals"
                )
            
            # Check minimum safe body fat
            min_bf = Decimal("8.0") if gender == Gender.MALE else Decimal("15.0")
            if target_bf < min_bf:
                raise ValueError(
                    f"Target body fat too low. "
                    f"Minimum safe level is {min_bf}% for {gender.value}s"
                )
            
            # Check target < current
            if target_bf >= current_bf:
                raise ValueError(
                    "Target body fat must be lower than current body fat "
                    "for cutting goals"
                )
        
        elif goal_type == GoalType.BULKING:
            if ceiling_bf is None:
                raise ValueError(
                    "ceiling_body_fat_percentage required for bulking goals"
                )
            
            # Check maximum safe body fat
            if ceiling_bf > Decimal("30.0"):
                raise ValueError(
                    "Ceiling body fat too high. Maximum safe level is 30%"
                )
            
            # Check ceiling > current
            if ceiling_bf <= current_bf:
                raise ValueError(
                    "Ceiling body fat must be higher than current body fat "
                    "for bulking goals"
                )

    @staticmethod
    async def check_active_goal_exists(
        db: AsyncSession,
        user_id: UUID,
    ) -> bool:
        """
        Check if user has an active goal (FR-018).
        
        Returns True if active goal exists, False otherwise.
        """
        result = await db.execute(
            select(Goal)
            .where(Goal.user_id == user_id)
            .where(Goal.status == GoalStatus.ACTIVE)
        )
        return result.scalar_one_or_none() is not None

    async def create_goal(
        self,
        db: AsyncSession,
        user_id: UUID,
        goal_data: GoalCreate,
    ) -> Goal:
        """
        Create a new body recomposition goal.
        
        Validates:
        - Initial measurement exists and belongs to user
        - No other active goals exist (FR-018)
        - Goal is safe based on target/ceiling (FR-017)
        
        Calculates:
        - BMR using Mifflin-St Jeor
        - TDEE based on activity level
        - Target calories with appropriate deficit/surplus
        - Timeline estimation
        
        Returns created Goal with all calculated fields.
        """
        # Check for existing active goal (FR-018)
        has_active = await self.check_active_goal_exists(db, user_id)
        if has_active:
            raise ValueError(
                "User already has an active goal. "
                "Complete or cancel existing goal before creating a new one."
            )
        
        # Get user
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")
        
        # Get initial measurement
        result = await db.execute(
            select(BodyMeasurement)
            .where(BodyMeasurement.id == goal_data.initial_measurement_id)
        )
        measurement = result.scalar_one_or_none()
        if not measurement:
            raise ValueError("Initial measurement not found")
        
        # Verify measurement belongs to user
        if measurement.user_id != user_id:
            raise ValueError(
                "Initial measurement does not belong to this user"
            )
        
        # Validate goal safety (FR-017)
        await self.validate_goal_safety(
            goal_data.goal_type,
            measurement.calculated_body_fat_percentage,
            goal_data.target_body_fat_percentage,
            goal_data.ceiling_body_fat_percentage,
            user.gender,
        )
        
        # Calculate age from date of birth
        age = (datetime.utcnow() - user.date_of_birth).days // 365
        
        # Calculate BMR and TDEE
        bmr = self.calculate_bmr(
            measurement.weight_kg,
            user.height_cm,
            age,
            user.gender,
        )
        tdee = self.calculate_tdee(bmr, user.activity_level)
        
        # Calculate target calories based on goal type
        if goal_data.goal_type == GoalType.CUTTING:
            target_calories = self.calculate_cutting_calories(
                tdee,
                user.gender,
            )
            estimated_weeks = self.estimate_cutting_timeline(
                measurement.calculated_body_fat_percentage,
                goal_data.target_body_fat_percentage,
            )
        else:  # BULKING
            target_calories = self.calculate_bulking_calories(tdee)
            estimated_weeks = self.estimate_bulking_timeline(
                measurement.calculated_body_fat_percentage,
                goal_data.ceiling_body_fat_percentage,
            )
        
        # Create goal
        goal = Goal(
            user_id=user_id,
            goal_type=goal_data.goal_type,
            status=GoalStatus.ACTIVE,
            initial_measurement_id=goal_data.initial_measurement_id,
            initial_body_fat_percentage=(
                measurement.calculated_body_fat_percentage
            ),
            initial_weight_kg=measurement.weight_kg,
            target_body_fat_percentage=(
                goal_data.target_body_fat_percentage
            ),
            ceiling_body_fat_percentage=(
                goal_data.ceiling_body_fat_percentage
            ),
            target_calories=target_calories,
            estimated_weeks_to_goal=estimated_weeks,
            started_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        db.add(goal)
        await db.flush()
        await db.refresh(goal)
        
        return goal

    async def check_goal_completion(
        self,
        db: AsyncSession,
        goal_id: UUID,
        current_body_fat: Decimal,
    ) -> bool:
        """
        Check if goal has been completed and update status if so.
        
        Args:
            db: Database session
            goal_id: Goal to check
            current_body_fat: Current body fat percentage from latest entry
            
        Returns:
            True if goal was completed, False otherwise
        """
        result = await db.execute(
            select(Goal).where(Goal.id == goal_id)
        )
        goal = result.scalar_one_or_none()
        
        if not goal or goal.status != GoalStatus.ACTIVE:
            return False
        
        completed = False
        
        if goal.goal_type == GoalType.CUTTING:
            # Cutting goal is complete when current BF <= target BF
            if (goal.target_body_fat_percentage and 
                current_body_fat <= goal.target_body_fat_percentage):
                completed = True
        else:
            # Bulking goal is complete when current BF >= ceiling BF
            if (goal.ceiling_body_fat_percentage and 
                current_body_fat >= goal.ceiling_body_fat_percentage):
                completed = True
        
        if completed:
            goal.status = GoalStatus.COMPLETED
            goal.completed_at = datetime.utcnow()
            await db.commit()
            await db.refresh(goal)
            return True
        
        return False
