/**
 * Number and measurement formatting utilities
 */

/**
 * Format a number with specified decimal places
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals);
};

/**
 * Format weight (kg or lbs) with unit
 */
export const formatWeight = (
  value: number,
  unit: 'metric' | 'imperial' = 'metric'
): string => {
  if (unit === 'imperial') {
    const lbs = value * 2.20462;
    return `${formatNumber(lbs, 1)} lbs`;
  }
  return `${formatNumber(value, 1)} kg`;
};

/**
 * Format height (cm or ft/in)
 */
export const formatHeight = (
  value: number,
  unit: 'metric' | 'imperial' = 'metric'
): string => {
  if (unit === 'imperial') {
    const totalInches = value * 0.393701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}' ${inches}"`;
  }
  return `${formatNumber(value, 0)} cm`;
};

/**
 * Format body fat percentage
 */
export const formatBodyFat = (value: number): string => {
  return `${formatNumber(value, 1)}%`;
};

/**
 * Format circumference measurements (cm or inches)
 */
export const formatCircumference = (
  value: number,
  unit: 'metric' | 'imperial' = 'metric'
): string => {
  if (unit === 'imperial') {
    const inches = value * 0.393701;
    return `${formatNumber(inches, 1)} in`;
  }
  return `${formatNumber(value, 1)} cm`;
};

/**
 * Format calorie values
 */
export const formatCalories = (value: number): string => {
  return `${Math.round(value)} kcal`;
};

/**
 * Format macro values (g or %)
 */
export const formatMacros = (value: number, asPercentage: boolean = false): string => {
  if (asPercentage) {
    return `${Math.round(value)}%`;
  }
  return `${Math.round(value)}g`;
};

/**
 * Convert kg to lbs
 */
export const kgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

/**
 * Convert lbs to kg
 */
export const lbsToKg = (lbs: number): number => {
  return lbs / 2.20462;
};

/**
 * Convert cm to inches
 */
export const cmToInches = (cm: number): number => {
  return cm * 0.393701;
};

/**
 * Convert inches to cm
 */
export const inchesToCm = (inches: number): number => {
  return inches / 0.393701;
};

/**
 * Parse and validate numeric input
 */
export const parseNumericInput = (input: string): number | null => {
  const cleaned = input.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate percentage between two numbers
 */
export const calculatePercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return (current / target) * 100;
};

/**
 * Calculate progress percentage from start to target
 */
export const calculateProgress = (
  start: number,
  current: number,
  target: number
): number => {
  if (start === target) return 100;
  const progress = ((start - current) / (start - target)) * 100;
  return clamp(progress, 0, 100);
};
