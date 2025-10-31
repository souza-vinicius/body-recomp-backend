"""
Unit tests for goal service calculation methods.
Tests BMR, TDEE, calorie targets, and timeline calculations.
"""
import pytest
from decimal import Decimal

from src.services.goal_service import GoalService
from src.models.enums import Gender, ActivityLevel


class TestBMRCalculation:
    """Test Basal Metabolic Rate using Mifflin-St Jeor equation."""
    
    def test_calculate_bmr_male(self):
        """Test BMR calculation for males."""
        service = GoalService()
        
        # Male: 80kg, 175cm, 30 years
        # BMR = 10*80 + 6.25*175 - 5*30 + 5 = 800 + 1093.75 - 150 + 5 = 1748.75
        bmr = service.calculate_bmr(
            weight_kg=Decimal("80.0"),
            height_cm=Decimal("175.0"),
            age_years=30,
            gender=Gender.MALE,
        )
        
        assert bmr == 1749  # Rounded
        assert isinstance(bmr, int)
    
    def test_calculate_bmr_female(self):
        """Test BMR calculation for females."""
        service = GoalService()
        
        # Female: 65kg, 165cm, 28 years
        # BMR = 10*65 + 6.25*165 - 5*28 - 161 = 650 + 1031.25 - 140 - 161 = 1380.25
        bmr = service.calculate_bmr(
            weight_kg=Decimal("65.0"),
            height_cm=Decimal("165.0"),
            age_years=28,
            gender=Gender.FEMALE,
        )
        
        assert bmr == 1380  # Rounded
    
    def test_bmr_male_higher_than_female(self):
        """Test males have ~166 cal/day higher BMR than females (same stats)."""
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
        assert male_bmr - female_bmr == 166


class TestTDEECalculation:
    """Test Total Daily Energy Expenditure with activity multipliers."""
    
    def test_tdee_sedentary(self):
        """Test TDEE = BMR × 1.2 for sedentary."""
        service = GoalService()
        assert service.calculate_tdee(1750, ActivityLevel.SEDENTARY) == 2100
    
    def test_tdee_lightly_active(self):
        """Test TDEE = BMR × 1.375 for lightly active."""
        service = GoalService()
        assert service.calculate_tdee(1750, ActivityLevel.LIGHTLY_ACTIVE) == 2406
    
    def test_tdee_moderately_active(self):
        """Test TDEE = BMR × 1.55 for moderately active."""
        service = GoalService()
        # 1750 × 1.55 = 2712.5, rounds to 2712
        assert service.calculate_tdee(1750, ActivityLevel.MODERATELY_ACTIVE) == 2712
    
    def test_tdee_very_active(self):
        """Test TDEE = BMR × 1.725 for very active."""
        service = GoalService()
        assert service.calculate_tdee(1750, ActivityLevel.VERY_ACTIVE) == 3019
    
    def test_tdee_extremely_active(self):
        """Test TDEE = BMR × 1.9 for extremely active."""
        service = GoalService()
        assert service.calculate_tdee(1750, ActivityLevel.EXTREMELY_ACTIVE) == 3325


class TestCuttingCalories:
    """Test cutting calorie calculations with deficit."""
    
    def test_cutting_calories_male_with_deficit(self):
        """Test cutting = TDEE - 400 for males."""
        service = GoalService()
        target = service.calculate_cutting_calories(2700, Gender.MALE)
        assert target == 2300  # 2700 - 400
    
    def test_cutting_calories_female_with_deficit(self):
        """Test cutting = TDEE - 400 for females."""
        service = GoalService()
        target = service.calculate_cutting_calories(2200, Gender.FEMALE)
        assert target == 1800  # 2200 - 400
    
    def test_cutting_enforces_male_minimum_1500(self):
        """Test males can't go below 1500 cal/day."""
        service = GoalService()
        target = service.calculate_cutting_calories(1700, Gender.MALE)
        assert target == 1500  # Not 1300
    
    def test_cutting_enforces_female_minimum_1200(self):
        """Test females can't go below 1200 cal/day."""
        service = GoalService()
        target = service.calculate_cutting_calories(1400, Gender.FEMALE)
        assert target == 1200  # Not 1000
    
    def test_cutting_custom_deficit(self):
        """Test cutting with custom deficit."""
        service = GoalService()
        target = service.calculate_cutting_calories(2700, Gender.MALE, deficit=500)
        assert target == 2200  # 2700 - 500


class TestBulkingCalories:
    """Test bulking calorie calculations with surplus."""
    
    def test_bulking_calories_default_surplus(self):
        """Test bulking = TDEE + 250 (default)."""
        service = GoalService()
        target = service.calculate_bulking_calories(2700)
        assert target == 2950  # 2700 + 250
    
    def test_bulking_calories_custom_surplus(self):
        """Test bulking with custom surplus."""
        service = GoalService()
        target = service.calculate_bulking_calories(2500, surplus=300)
        assert target == 2800  # 2500 + 300


class TestTimelineEstimation:
    """Test cutting and bulking timeline estimations."""
    
    def test_cutting_timeline_default_rate(self):
        """Test cutting timeline at 0.75% BF loss/month."""
        service = GoalService()
        # 22.5% -> 15% = 7.5% difference
        # At 0.75%/month = 10 months = ~43 weeks
        weeks = service.estimate_cutting_timeline(
            current_bf=Decimal("22.5"),
            target_bf=Decimal("15.0"),
        )
        assert 40 <= weeks <= 45
    
    def test_cutting_timeline_aggressive_rate(self):
        """Test cutting timeline at 1.0% BF loss/month."""
        service = GoalService()
        # 20% -> 15% = 5% difference
        # At 1.0%/month = 5 months = ~22 weeks
        weeks = service.estimate_cutting_timeline(
            current_bf=Decimal("20.0"),
            target_bf=Decimal("15.0"),
            rate_per_month=1.0,
        )
        assert 20 <= weeks <= 25
    
    def test_bulking_timeline_default_rate(self):
        """Test bulking timeline at 0.2% BF gain/month."""
        service = GoalService()
        # 12% -> 18% = 6% difference
        # At 0.2%/month = 30 months = ~130 weeks
        weeks = service.estimate_bulking_timeline(
            current_bf=Decimal("12.0"),
            ceiling_bf=Decimal("18.0"),
        )
        assert 125 <= weeks <= 135
    
    def test_bulking_timeline_aggressive_rate(self):
        """Test bulking timeline at 0.3% BF gain/month."""
        service = GoalService()
        # 10% -> 15% = 5% difference
        # At 0.3%/month = 16.67 months = ~72 weeks
        weeks = service.estimate_bulking_timeline(
            current_bf=Decimal("10.0"),
            ceiling_bf=Decimal("15.0"),
            rate_per_month=0.3,
        )
        assert 70 <= weeks <= 75


class TestGoalSafetyValidation:
    """Test goal safety validation (FR-017)."""
    
    @pytest.mark.asyncio
    async def test_cutting_target_too_low_for_male(self):
        """Test males can't target below 8% BF."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="Target body fat too low"):
            await service.validate_goal_safety(
                goal_type="cutting",
                current_bf=Decimal("15.0"),
                target_bf=Decimal("5.0"),
                ceiling_bf=None,
                gender=Gender.MALE,
            )
    
    @pytest.mark.asyncio
    async def test_cutting_target_too_low_for_female(self):
        """Test females can't target below 15% BF."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="Target body fat too low"):
            await service.validate_goal_safety(
                goal_type="cutting",
                current_bf=Decimal("25.0"),
                target_bf=Decimal("12.0"),
                ceiling_bf=None,
                gender=Gender.FEMALE,
            )
    
    @pytest.mark.asyncio
    async def test_bulking_ceiling_too_high(self):
        """Test bulking ceiling can't exceed 30% BF."""
        service = GoalService()
        
        with pytest.raises(ValueError, match="Ceiling body fat too high"):
            await service.validate_goal_safety(
                goal_type="bulking",
                current_bf=Decimal("12.0"),
                target_bf=None,
                ceiling_bf=Decimal("35.0"),
                gender=Gender.MALE,
            )
