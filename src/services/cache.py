"""
Simple caching utilities for expensive calculations.

For production, consider using Redis or another distributed cache.
This implementation uses Python's functools.lru_cache for in-memory caching.
"""
from functools import lru_cache
from typing import Tuple


@lru_cache(maxsize=1000)
def calculate_bmr_cached(
    weight_kg: float,
    height_cm: float,
    age: int,
    sex: str
) -> float:
    """
    Cache BMR calculations using Mifflin-St Jeor equation.
    
    BMR (Basal Metabolic Rate) depends only on physical characteristics
    that change infrequently, making it ideal for caching.
    
    Args:
        weight_kg: Body weight in kilograms
        height_cm: Height in centimeters
        age: Age in years
        sex: 'male' or 'female'
    
    Returns:
        BMR in calories per day
    """
    if sex == 'male':
        # Men: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        # Women: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161


@lru_cache(maxsize=1000)
def calculate_tdee_cached(
    bmr: float,
    activity_level: str
) -> float:
    """
    Cache TDEE calculations based on BMR and activity level.
    
    TDEE (Total Daily Energy Expenditure) = BMR × activity multiplier
    
    Args:
        bmr: Basal metabolic rate
        activity_level: Activity level (sedentary, lightly_active, etc.)
    
    Returns:
        TDEE in calories per day
    """
    activity_multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9,
    }
    
    multiplier = activity_multipliers.get(activity_level, 1.2)
    return bmr * multiplier


def get_cache_info() -> Tuple[dict, dict]:
    """
    Get cache statistics for monitoring.
    
    Returns:
        Tuple of (bmr_stats, tdee_stats) dictionaries
    """
    bmr_info = calculate_bmr_cached.cache_info()
    tdee_info = calculate_tdee_cached.cache_info()
    
    return (
        {
            'hits': bmr_info.hits,
            'misses': bmr_info.misses,
            'maxsize': bmr_info.maxsize,
            'currsize': bmr_info.currsize,
            'hit_rate': (
                bmr_info.hits / (bmr_info.hits + bmr_info.misses)
                if (bmr_info.hits + bmr_info.misses) > 0
                else 0
            )
        },
        {
            'hits': tdee_info.hits,
            'misses': tdee_info.misses,
            'maxsize': tdee_info.maxsize,
            'currsize': tdee_info.currsize,
            'hit_rate': (
                tdee_info.hits / (tdee_info.hits + tdee_info.misses)
                if (tdee_info.hits + tdee_info.misses) > 0
                else 0
            )
        }
    )


def clear_cache() -> None:
    """Clear all cached calculations."""
    calculate_bmr_cached.cache_clear()
    calculate_tdee_cached.cache_clear()
