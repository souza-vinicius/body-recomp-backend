/**
 * Training and Diet Plan types
 * Personalized recommendations based on goal type
 */

import { GoalType } from './goals';

export type PlanType = 'TRAINING' | 'DIET';

export interface Plan {
  id: string;
  userId: string;
  goalId: string;
  goalType: GoalType;
  planType: PlanType;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPlan extends Plan {
  planType: 'TRAINING';
  recommendations: {
    workoutsPerWeek: number;
    sessionsPerWeek: number;
    restDays: number;
    focus: string; // e.g., "Strength + Cardio" or "Progressive Overload"
    exercises: {
      category: string; // e.g., "Strength", "Cardio", "Compound"
      exercises: string[]; // List of exercise names
      setsReps?: string; // e.g., "3-4 sets of 8-12 reps"
      duration?: string; // e.g., "30-45 minutes"
      frequency?: string; // e.g., "3x per week"
    }[];
    tips: string[];
    progression: string; // How to progress over time
  };
}

export interface MacroBreakdown {
  calories: number;
  protein: {
    grams: number;
    percentage: number;
    calories: number;
  };
  carbs: {
    grams: number;
    percentage: number;
    calories: number;
  };
  fats: {
    grams: number;
    percentage: number;
    calories: number;
  };
}

export interface DietPlan extends Plan {
  planType: 'DIET';
  recommendations: {
    dailyCalories: number;
    weeklyDeficitOrSurplus: number; // Negative for deficit, positive for surplus
    macros: MacroBreakdown;
    mealTiming: {
      preworkout: string;
      postworkout: string;
      general: string;
    };
    hydration: string; // e.g., "3-4 liters per day"
    supplements?: string[]; // Optional supplement recommendations
    tips: string[];
  };
}

export type PlanUnion = TrainingPlan | DietPlan;

export interface PlansResponse {
  training?: TrainingPlan;
  diet?: DietPlan;
}

export interface RegeneratePlanRequest {
  goalId: string;
  planType: PlanType;
}
