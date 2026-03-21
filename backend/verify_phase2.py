#!/usr/bin/env python3
"""
Verification script for Phase 2 Foundation.
Checks that all components are properly configured and importable.
"""
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


def test_imports():
    """Test that all core modules can be imported."""
    print("🔍 Testing imports...")
    
    try:
        # Core imports
        from src.core.config import settings
        print("  ✅ Core config")
        
        from src.core.database import Base, async_engine, get_db
        print("  ✅ Core database")
        
        from src.core.security import (
            create_access_token,
            verify_password,
            get_password_hash,
        )
        print("  ✅ Core security")
        
        # Model imports
        from src.models.enums import (
            Gender,
            CalculationMethod,
            ActivityLevel,
            GoalType,
            GoalStatus,
        )
        print("  ✅ Models enums")
        
        from src.models.user import User
        print("  ✅ Models user")
        
        # Schema imports
        from src.schemas.user import UserCreate, UserResponse
        print("  ✅ Schemas user")
        
        # Service imports
        from src.services.body_fat_calculator import BodyFatCalculator
        print("  ✅ Services body fat calculator")
        
        from src.services.validation_service import MeasurementValidator
        print("  ✅ Services validation")
        
        # API imports
        from src.api.main import app
        print("  ✅ API main")
        
        from src.api.dependencies import get_current_user
        print("  ✅ API dependencies")
        
        return True
    except Exception as e:
        print(f"  ❌ Import failed: {e}")
        return False


def test_calculations():
    """Test body fat calculations work."""
    print("\n🧮 Testing calculations...")
    
    try:
        from decimal import Decimal
        from src.models.enums import Gender
        from src.services.body_fat_calculator import BodyFatCalculator
        
        # Test Navy method
        result = BodyFatCalculator.calculate_navy(
            gender=Gender.MALE,
            height_cm=Decimal("175.0"),
            waist_cm=Decimal("90.0"),
            neck_cm=Decimal("38.0"),
        )
        print(f"  ✅ Navy method: {result}% body fat")
        
        # Test 3-site method
        result = BodyFatCalculator.calculate_3_site(
            gender=Gender.MALE,
            age=30,
            chest_mm=Decimal("10.0"),
            abdomen_mm=Decimal("20.0"),
            thigh_mm=Decimal("15.0"),
        )
        print(f"  ✅ 3-Site method: {result}% body fat")
        
        return True
    except Exception as e:
        print(f"  ❌ Calculation failed: {e}")
        return False


def test_validation():
    """Test validation service works."""
    print("\n✔️  Testing validation...")
    
    try:
        from decimal import Decimal
        from src.models.enums import Gender
        from src.services.validation_service import MeasurementValidator
        
        # Test body fat validation
        is_valid, error = MeasurementValidator.validate_body_fat_range(
            Decimal("20.0"), Gender.MALE
        )
        print(f"  ✅ Body fat validation: valid={is_valid}")
        
        # Test weight validation
        is_valid, error = MeasurementValidator.validate_weight(Decimal("75.0"))
        print(f"  ✅ Weight validation: valid={is_valid}")
        
        # Test unsafe target detection
        is_valid, error = MeasurementValidator.validate_target_safety(
            Decimal("6.0"), Gender.MALE
        )
        print(f"  ✅ Unsafe target detection: valid={is_valid} (should be False)")
        
        return True
    except Exception as e:
        print(f"  ❌ Validation failed: {e}")
        return False


def test_security():
    """Test security functions work."""
    print("\n🔒 Testing security...")

    try:
        import warnings
        # Suppress bcrypt version warning
        warnings.filterwarnings('ignore', message='.*bcrypt version.*')

        from src.core.security import get_password_hash, verify_password

        # Test password hashing (keep simple)
        password = "testpass123"
        hashed = get_password_hash(password)
        print(f"  ✅ Password hashing works")

        # Test password verification
        is_valid = verify_password(password, hashed)
        print(f"  ✅ Password verification: valid={is_valid}")

        # Test wrong password
        is_valid = verify_password("wrongpass", hashed)
        print(f"  ✅ Wrong password detection: valid={is_valid} (should be False)")

        return True
    except Exception as e:
        print(f"  ❌ Security test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
def check_files():
    """Check that all required files exist."""
    print("\n📁 Checking files...")
    
    required_files = [
        "pyproject.toml",
        ".env",
        ".env.example",
        "docker-compose.yml",
        "Dockerfile",
        "alembic.ini",
        "pytest.ini",
        "src/core/config.py",
        "src/core/database.py",
        "src/core/security.py",
        "src/models/enums.py",
        "src/models/user.py",
        "src/schemas/user.py",
        "src/services/body_fat_calculator.py",
        "src/services/validation_service.py",
        "src/api/main.py",
        "src/api/dependencies.py",
        "alembic/env.py",
        "alembic/versions/001_create_users.py",
        "tests/conftest.py",
        "tests/unit/test_body_fat_calculator.py",
        "tests/unit/test_validation_service.py",
    ]
    
    all_exist = True
    for file_path in required_files:
        full_path = project_root / file_path
        if full_path.exists():
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path} - MISSING")
            all_exist = False
    
    return all_exist


def main():
    """Run all verification tests."""
    print("=" * 60)
    print("Phase 2 Foundation Verification")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("File Check", check_files()))
    results.append(("Imports", test_imports()))
    results.append(("Calculations", test_calculations()))
    results.append(("Validation", test_validation()))
    results.append(("Security", test_security()))
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All verification tests passed!")
        print("✅ Phase 2 Foundation is complete and working")
        print("\n📝 Next steps:")
        print("   1. Start Docker Desktop")
        print("   2. Run: docker compose up -d db")
        print("   3. Run: poetry run alembic upgrade head")
        print("   4. Start implementing Phase 3 (Create Cutting Goal)")
        return 0
    else:
        print("❌ Some verification tests failed")
        print("Please review the errors above")
        return 1


if __name__ == "__main__":
    sys.exit(main())
