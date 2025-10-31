"""
Unit tests for GoalService.
Tests BMR, TDEE, calorie calculations, timeline estimates, and validations.
"""
import pytest
from decimal import Decimal
from datetime import date, datetime
from uuid import uuid4
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.goal_service import GoalService
from src.models.enums import Gender, ActivityLevel, GoalType, GoalStatus, CalculationMethod
from src.models.user import User
from src.models.measurement import BodyMeasurement
from src.models.goal import Goal
from src.schemas.goal import GoalCreate


class TestBMRCalculation:
    """Test Basal Metabolic Rate calculations."""
    
    def test_calculate_bmr_male(self):
        """Test BMR calculation for males using Mifflin-St Jeor equation."""
        service = GoalService()
        
        # Male: 80kg, 175cm, 30 years old
        # BMR = 10 × 80 + 6.25 × 175 - 5 × 30 + 5 = 1748.75 ≈ 1749
        bmr = service.calculate_bmr(
            weight_kg=Decimal("80.0"),
            height_cm=Decimal("175.0"),
            age_years=30,
            gender=Gender.MALE,
        )
        
        assert isinstance(bmr, int)
        assert bmr == 1749
    
    def test_calculate_bmr_female(self):
        """Test BMR calculation for females using Mifflin-St Jeor equation."""
        service = GoalService()
        
        # Female: 65kg, 165cm, 28 years old
        # BMR = 10 × 65 + 6.25 × 165 - 5 × 28 - 161 = 1370.25 ≈ 1370
        bmr = service.calculate_bmr(
            weight_kg=Decimal("65.0"),
            height_cm=Decimal("165.0"),
            age_years=28,
            gender=Gender.FEMALE,
        )
        
        assert isinstance(bmr, int)
        assert bmr == 1370
    
    def test_calculate_bmr_male_higher_than_female(self):
        """Test that males have higher BMR than females with same measurements."""
        service = GoalService()
        
        male_bmr = service.calculate_bmr(
            weight_kg=Decimal("70.0"),
            height_cm=Decimal("170.0"),
            age_years=25,
            gender=Gender.MALE,
        )
        
        female_bmr = service.calculate_bmr(
            weight_kg=Decimal("70.0"),
            height_cm=Decimal("170.0"),
            age_years=25,
            gender=Gender.FEMALE,
        )
        
        assert male_bmr > female_bmr
        assert male_bmr - female_bmr == 166  # Difference is 5 - (-161) = 166


class TestTDEECalculation:
    """Test Total Daily Energy Expenditure calculations."""
    
    def test_calculate_tdee_sedentary(self):
        """Test TDEE with sedentary activity level (1.2x)."""
        service = GoalService()
        bmr = 1750
        
        tdee = service.calculate_tdee(bmr, ActivityLevel.SEDENTARY)
        
        assert tdee == 2100  # 1750 × 1.2
    
    def test_calculate_tdee_lightly_active(self):
        """Test TDEE with lightly active level (1.375x)."""
        service = GoalService()
        bmr = 1750
        
        tdee = service.calculate_tdee(bmr, ActivityLevel.LIGHTLY_ACTIVE)
        
        assert tdee == 2406  # 1750 × 1.375
    
    def test_calculate_tdee_moderately_active(self):
        """Test TDEE with moderately active level (1.55x)."""
        service = GoalService()
        bmr = 1750
        
        tdee = service.calculate_tdee(bmr, ActivityLevel.MODERATELY_ACTIVE)
        
        assert tdee == 2713  # 1750 × 1.55
    
    def test_calculate_tdee_very_active(self):
        """Test TDEE with very active level (1.725x)."""
        service = GoalService()
        bmr = 1750
        
        tdee = service.calculate_tdee(bmr, ActivityLevel.VERY_ACTIVE)
        
        assert tdee == 3019  # 1750 × 1.725
    
    def test_calculate_tdee_extremely_active(self):
        """Test TDEE with extremely active level (1.9x)."""
        service = GoalService()
        bmr = 1750
        
        tdee = service.calculate_tdee(bmr, ActivityLevel.EXTREMELY_ACTIVE)
        
        assert tdee == 3325  # 1750 × 1.9


class TestCuttingCalories:
    """Test cutting calorie calculations."""
    
    def test_calculate_cutting_calories_male(self):
        """Test cutting calories for males with 400 cal deficit."""
        service = GoalService()
        tdee = 2700
        
        target = service.calculate_cutting_calories(tdee, Gender.MALE)
        
        assert target == 2300  # 2700 - 400
    
    def test_calculate_cutting_calories_female(self):
        """Test cutting calories for females with 400 cal deficit."""
        service = GoalService()
        tdee = 2200
        
        target = service.calculate_cutting_calories(tdee, Gender.FEMALE)
        
        assert target == 1800  # 2200 - 400
    
    def test_calculate_cutting_calories_enforces_male_minimum(self):
        """Test that cutting calories respects 1500 cal minimum for males."""
        service = GoalService()
        tdee = 1700
        
        target = service.calculate_cutting_calories(tdee, Gender.MALE)
        
        assert target == 1500  # Should not go below 1500
    
    def test_calculate_cutting_calories_enforces_female_minimum(self):
        """Test that cutting calories respects 1200 cal minimum for females."""
        service = GoalService()
        tdee = 1400
        
        target = service.calculate_cutting_calories(tdee, Gender.FEMALE)
        
        assert target == 1200  # Should not go below 1200
    
    def test_calculate_cutting_calories_custom_deficit(self):
        """Test cutting calories with custom deficit."""
        service = GoalService()
        tdee = 2700
        
        target = service.calculate_cutting_calories(tdee, Gender.MALE, deficit=500)
        
        assert target == 2200  # 2700 - 500


class TestBulkingCalories:
    """Test bulking calorie calculations."""
    
    def test_calculate_bulking_calories_default_surplus(self):
        """Test bulking calories with default 250 cal surplus."""
        service = GoalService()
        tdee = 2700
        
        target = service.calculate_bulking_calories(tdee)
        
        assert target == 2950  # 2700 + 250
    
    def test_calculate_bulking_calories_custom_surplus(self):
        """Test bulking calories with custom surplus."""
        service = GoalService()
        tdee = 2500
        
        target = service.calculate_bulking_calories(tdee, surplus=300)
        
        assert target == 2800  # 2500 + 300


class TestCuttingTimeline:
    """Test cutting timeline estimation."""
    
    def test_estimate_cutting_timeline_default_rate(self):
        """Test cutting timeline with default 0.75% BF loss per month."""
        service = GoalService()
        
        # From 22.5% to 15% = 7.5% difference
        # At 0.75% per month = 10 months = 43.3 weeks
        weeks = service.estimate_cutting_timeline(
            current_bf=Decimal("22.5"),
            target_bf=Decimal("15.0"),
        )
        
        assert isinstance(weeks, int)
        assert 40 <= weeks <= 45  # Around 43 weeks
    
    def test_estimate_cutting_timeline_aggressive_rate(self):
        """Test cutting timeline with aggressive 1.0% BF loss per month."""
        service = GoalService()
        
        # From 20% to 15% = 5% difference
        # At 1.0% per month = 5 months = 21.65 weeks
        weeks = service.estimate_cutting_timeline(
            current_bf=Decimal("20.0"),
            target_bf=Decimal("15.0"),
            rate_per_month=1.0,
        )
        
        assert 20 <= weeks <= 25  # Around 22 weeks
    
    def test_estimate_cutting_timeline_conservative_rate(self):
        """Test cutting timeline with conservative 0.5% BF loss per month."""
        service = GoalService()
        
        # From 25% to 20% = 5% difference
        # At 0.5% per month = 10 months = 43.3 weeks
        weeks = service.estimate_cutting_timeline(
            current_bf=Decimal("25.0"),
            target_bf=Decimal("20.0"),
            rate_per_month=0.5,
        )
        
        assert 40 <= weeks <= 45  # Around 43 weeks


class TestBulkingTimeline:
    """Test bulking timeline estimation."""
    
    def test_estimate_bulking_timeline_default_rate(self):
        """Test bulking timeline with default 0.2% BF gain per month."""
        service = GoalService()
        
        # From 12% to 18% = 6% difference
        # At 0.2% per month = 30 months = 130 weeks
        weeks = service.estimate_bulking_timeline(
            current_bf=Decimal("12.0"),
            ceiling_bf=Decimal("18.0"),
        )
        
        assert isinstance(weeks, int)
        assert 125 <= weeks <= 135  # Around 130 weeks
    
    def test_estimate_bulking_timeline_aggressive_rate(self):
        """Test bulking timeline with aggressive 0.3% BF gain per month."""
        service = GoalService()
        
        # From 10% to 15% = 5% difference
        # At 0.3% per month = 16.67 months = 72 weeks
        weeks = service.estimate_bulking_timeline(
            current_bf=Decimal("10.0"),
            ceiling_bf=Decimal("15.0"),
            rate_per_month=0.3,
        )
        
        assert 70 <= weeks <= 75  # Around 72 weeks


class TestGoalSafetyValidation:
    """Test goal safety validation (FR-017)."""
    
    @pytest.mark.asyncio
    async def test_validate_cutting_target_too_low_for_male(self):
        """Test that cutting target below 8% for males raises error."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="Target body fat too low"):
            await service.validate_goal_safety(
                goal_type=GoalType.CUTTING,
                current_bf=Decimal("15.0"),
                target_bf=Decimal("5.0"),  # Below 8% minimum
                ceiling_bf=None,
                gender=Gender.MALE,
            )
    
    @pytest.mark.asyncio
    async def test_validate_cutting_target_too_low_for_female(self):
        """Test that cutting target below 15% for females raises error."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="Target body fat too low"):
            await service.validate_goal_safety(
                goal_type=GoalType.CUTTING,
                current_bf=Decimal("25.0"),
                target_bf=Decimal("12.0"),  # Below 15% minimum
                ceiling_bf=None,
                gender=Gender.FEMALE,
            )
    
    @pytest.mark.asyncio
    async def test_validate_cutting_target_not_below_current(self):
        """Test that cutting target must be below current BF%."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="Target body fat must be lower"):
            await service.validate_goal_safety(
                goal_type=GoalType.CUTTING,
                current_bf=Decimal("15.0"),
                target_bf=Decimal("20.0"),  # Higher than current
                ceiling_bf=None,
                gender=Gender.MALE,
            )
    
    @pytest.mark.asyncio
    async def test_validate_cutting_requires_target(self):
        """Test that cutting goals require target_body_fat_percentage."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="target_body_fat_percentage required"):
            await service.validate_goal_safety(
                goal_type=GoalType.CUTTING,
                current_bf=Decimal("20.0"),
                target_bf=None,  # Missing
                ceiling_bf=None,
                gender=Gender.MALE,
            )
    
    @pytest.mark.asyncio
    async def test_validate_bulking_ceiling_too_high(self):
        """Test that bulking ceiling above 30% raises error."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="Ceiling body fat too high"):
            await service.validate_goal_safety(
                goal_type=GoalType.BULKING,
                current_bf=Decimal("12.0"),
                target_bf=None,
                ceiling_bf=Decimal("35.0"),  # Above 30% maximum
                gender=Gender.MALE,
            )
    
    @pytest.mark.asyncio
    async def test_validate_bulking_ceiling_not_above_current(self):
        """Test that bulking ceiling must be above current BF%."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="Ceiling body fat must be higher"):
            await service.validate_goal_safety(
                goal_type=GoalType.BULKING,
                current_bf=Decimal("18.0"),
                target_bf=None,
                ceiling_bf=Decimal("15.0"),  # Lower than current
                gender=Gender.MALE,
            )
    
    @pytest.mark.asyncio
    async def test_validate_bulking_requires_ceiling(self):
        """Test that bulking goals require ceiling_body_fat_percentage."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="ceiling_body_fat_percentage required"):
            await service.validate_goal_safety(
                goal_type=GoalType.BULKING,
                current_bf=Decimal("12.0"),
                target_bf=None,
                ceiling_bf=None,  # Missing
                gender=Gender.MALE,
            )
    
    @pytest.mark.asyncio
    async def test_validate_safe_cutting_goal_passes(self):
        """Test that safe cutting goal passes validation."""
        service = GoalService()
        
        # Should not raise
        await service.validate_goal_safety(
            goal_type=GoalType.CUTTING,
            current_bf=Decimal("20.0"),
            target_bf=Decimal("12.0"),
            ceiling_bf=None,
            gender=Gender.MALE,
        )
    
    @pytest.mark.asyncio
    async def test_validate_safe_bulking_goal_passes(self):
        """Test that safe bulking goal passes validation."""
        service = GoalService()
        
        # Should not raise
        await service.validate_goal_safety(
            goal_type=GoalType.BULKING,
            current_bf=Decimal("12.0"),
            target_bf=None,
            ceiling_bf=Decimal("18.0"),
            gender=Gender.MALE,
        )


class TestActiveGoalCheck:
    """Test checking for existing active goals."""
    
    @pytest.mark.asyncio
    async def test_check_active_goal_exists_returns_true(self, db_session: AsyncSession):
        """Test that active goal check returns True when active goal exists."""
        # Create test user
        user = User(
            email="test@example.com",
            hashed_password="hashed",
            full_name="Test User",
            date_of_birth=date(1990, 1, 1),
            gender=Gender.MALE,
            height_cm=Decimal("175.0"),
            preferred_calculation_method=CalculationMethod.NAVY,
            activity_level=ActivityLevel.MODERATELY_ACTIVE,
        )
        db_session.add(user)
        await db_session.flush()
        
        # Create active goal
        goal = Goal(
            user_id=user.id,
            goal_type=GoalType.CUTTING,
            status=GoalStatus.ACTIVE,
            initial_measurement_id=uuid4(),
            initial_body_fat_percentage=Decimal("20.0"),
            target_body_fat_percentage=Decimal("15.0"),
            initial_weight_kg=Decimal("80.0"),
            target_calories=2200,
            estimated_weeks_to_goal=30,
            started_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db_session.add(goal)
        await db_session.commit()
        
        service = GoalService()
        has_active = await service.check_active_goal_exists(db_session, user.id)
        
        assert has_active is True
    
    @pytest.mark.asyncio
    async def test_check_active_goal_exists_returns_false(self, db_session: AsyncSession):
        """Test that active goal check returns False when no active goal."""
        # Create test user without goals
        user = User(
            email="test2@example.com",
            hashed_password="hashed",
            full_name="Test User 2",
            date_of_birth=date(1990, 1, 1),
            gender=Gender.MALE,
            height_cm=Decimal("175.0"),
            preferred_calculation_method=CalculationMethod.NAVY,
            activity_level=ActivityLevel.MODERATELY_ACTIVE,
        )
        db_session.add(user)
        await db_session.commit()
        
        service = GoalService()
        has_active = await service.check_active_goal_exists(db_session, user.id)
        
        assert has_active is False
    
    @pytest.mark.asyncio
    async def test_check_active_goal_ignores_completed_goals(self, db_session: AsyncSession):
        """Test that completed goals don't count as active."""
        # Create test user
        user = User(
            email="test3@example.com",
            hashed_password="hashed",
            full_name="Test User 3",
            date_of_birth=date(1990, 1, 1),
            gender=Gender.MALE,
            height_cm=Decimal("175.0"),
            preferred_calculation_method=CalculationMethod.NAVY,
            activity_level=ActivityLevel.MODERATELY_ACTIVE,
        )
        db_session.add(user)
        await db_session.flush()
        
        # Create completed goal
        goal = Goal(
            user_id=user.id,
            goal_type=GoalType.CUTTING,
            status=GoalStatus.COMPLETED,  # Not active
            initial_measurement_id=uuid4(),
            initial_body_fat_percentage=Decimal("20.0"),
            target_body_fat_percentage=Decimal("15.0"),
            initial_weight_kg=Decimal("80.0"),
            target_calories=2200,
            estimated_weeks_to_goal=30,
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db_session.add(goal)
        await db_session.commit()
        
        service = GoalService()
        has_active = await service.check_active_goal_exists(db_session, user.id)
        
        assert has_active is False
