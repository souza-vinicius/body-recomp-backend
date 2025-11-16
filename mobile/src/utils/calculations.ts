/**
 * Body composition calculations
 * Formulas for Navy Method, 3-Site Skinfold, and 7-Site Skinfold
 */

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type CalculationMethod = 'navy' | '3-site' | '7-site';

/**
 * Navy Method body fat calculation
 * Based on circumference measurements
 */
export const calculateNavyBodyFat = (params: {
  gender: Gender;
  weight: number;
  waist: number;
  neck: number;
  hip?: number; // Required for females
  height: number;
}): number => {
  const { gender, waist, neck, hip, height } = params;

  if (gender === 'MALE') {
    // Male formula: 86.010 × log10(abdomen - neck) - 70.041 × log10(height) + 36.76
    const bodyFat = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    return Math.max(0, Math.min(100, bodyFat));
  } else {
    // Female formula: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
    if (!hip) {
      throw new Error('Hip measurement required for female Navy Method calculation');
    }
    const bodyFat =
      163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    return Math.max(0, Math.min(100, bodyFat));
  }
};

/**
 * 3-Site Skinfold body fat calculation
 * Jackson & Pollock formula
 */
export const calculate3SiteBodyFat = (params: {
  gender: Gender;
  age: number;
  // For males: chest, abdomen, thigh
  chest?: number;
  abdomen?: number;
  thigh?: number;
  // For females: tricep, suprailiac, thigh
  tricep?: number;
  suprailiac?: number;
}): number => {
  const { gender, age } = params;

  if (gender === 'MALE') {
    const { chest, abdomen, thigh } = params;
    if (!chest || !abdomen || !thigh) {
      throw new Error('Chest, abdomen, and thigh measurements required for male 3-site calculation');
    }

    const sum = chest + abdomen + thigh;
    const bodyDensity =
      1.10938 - 0.0008267 * sum + 0.0000016 * Math.pow(sum, 2) - 0.0002574 * age;
    const bodyFat = (495 / bodyDensity - 450);
    return Math.max(0, Math.min(100, bodyFat));
  } else {
    const { tricep, suprailiac, thigh } = params;
    if (!tricep || !suprailiac || !thigh) {
      throw new Error('Tricep, suprailiac, and thigh measurements required for female 3-site calculation');
    }

    const sum = tricep + suprailiac + thigh;
    const bodyDensity =
      1.0994921 - 0.0009929 * sum + 0.0000023 * Math.pow(sum, 2) - 0.0001392 * age;
    const bodyFat = (495 / bodyDensity - 450);
    return Math.max(0, Math.min(100, bodyFat));
  }
};

/**
 * 7-Site Skinfold body fat calculation
 * Jackson & Pollock formula
 */
export const calculate7SiteBodyFat = (params: {
  gender: Gender;
  age: number;
  chest: number;
  abdomen: number;
  thigh: number;
  tricep: number;
  subscapular: number;
  suprailiac: number;
  midaxillary: number;
}): number => {
  const { gender, age, chest, abdomen, thigh, tricep, subscapular, suprailiac, midaxillary } =
    params;

  const sum = chest + abdomen + thigh + tricep + subscapular + suprailiac + midaxillary;

  if (gender === 'MALE') {
    const bodyDensity =
      1.112 - 0.00043499 * sum + 0.00000055 * Math.pow(sum, 2) - 0.00028826 * age;
    const bodyFat = (495 / bodyDensity - 450);
    return Math.max(0, Math.min(100, bodyFat));
  } else {
    const bodyDensity =
      1.097 - 0.00046971 * sum + 0.00000056 * Math.pow(sum, 2) - 0.00012828 * age;
    const bodyFat = (495 / bodyDensity - 450);
    return Math.max(0, Math.min(100, bodyFat));
  }
};

/**
 * Calculate ideal weight range based on body fat percentage goals
 */
export const calculateIdealWeightRange = (params: {
  currentWeight: number;
  currentBodyFat: number;
  targetBodyFatMin: number;
  targetBodyFatMax: number;
}): { minWeight: number; maxWeight: number } => {
  const { currentWeight, currentBodyFat, targetBodyFatMin, targetBodyFatMax } = params;

  // Calculate lean body mass (LBM)
  const leanBodyMass = currentWeight * (1 - currentBodyFat / 100);

  // Calculate ideal weight range
  const minWeight = leanBodyMass / (1 - targetBodyFatMax / 100);
  const maxWeight = leanBodyMass / (1 - targetBodyFatMin / 100);

  return {
    minWeight: Math.round(minWeight * 10) / 10,
    maxWeight: Math.round(maxWeight * 10) / 10,
  };
};

/**
 * Estimate caloric needs based on body composition and activity level
 */
export const calculateCaloricNeeds = (params: {
  weight: number;
  bodyFat: number;
  age: number;
  gender: Gender;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}): { bmr: number; tdee: number } => {
  const { weight, bodyFat, age, gender, activityLevel } = params;

  // Calculate lean body mass
  const leanBodyMass = weight * (1 - bodyFat / 100);

  // Katch-McArdle Formula (uses lean body mass)
  const bmr = 370 + 21.6 * leanBodyMass;

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * activityMultipliers[activityLevel];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
};

/**
 * Calculate recommended caloric deficit/surplus
 */
export const calculateCaloricAdjustment = (params: {
  tdee: number;
  goalType: 'CUTTING' | 'BULKING';
}): { dailyCalories: number; weeklyDeficitSurplus: number } => {
  const { tdee, goalType } = params;

  if (goalType === 'CUTTING') {
    // Moderate deficit: 20% below TDEE (approximately 0.5-1% body weight loss per week)
    const dailyCalories = Math.round(tdee * 0.8);
    const weeklyDeficitSurplus = (tdee - dailyCalories) * 7;
    return { dailyCalories, weeklyDeficitSurplus };
  } else {
    // Moderate surplus: 10% above TDEE (lean muscle gain)
    const dailyCalories = Math.round(tdee * 1.1);
    const weeklyDeficitSurplus = (dailyCalories - tdee) * 7;
    return { dailyCalories, weeklyDeficitSurplus };
  }
};
