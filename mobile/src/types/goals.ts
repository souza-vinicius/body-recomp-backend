/**
 * Goal Types
 * Defines TypeScript types for body recomposition goals (cutting/bulking)
 */

/**
 * Goal type enumeration
 */
export enum GoalType {
  CUTTING = 'CUTTING',
  BULKING = 'BULKING',
}

/**
 * Goal status enumeration
 */
export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Goal entity representing a user's body recomposition goal
 */
export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  status: GoalStatus;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  currentBodyFat: number; // Body fat % at goal creation
  targetBodyFat: number; // Target body fat % for cutting or ceiling for bulking
  recommendedCalories: number; // Daily caloric target
  weeklyDeficitOrSurplus: number; // Weekly caloric deficit (cutting) or surplus (bulking)
  notes?: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  completedAt?: string; // ISO 8601 timestamp when goal completed
}

/**
 * Request payload for creating a new goal
 */
export interface CreateGoalRequest {
  type: GoalType;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  targetBodyFat: number; // Target % or ceiling %
  initialMeasurementId: string; // Measurement ID used as baseline
  notes?: string;
}

/**
 * Request payload for updating an existing goal
 */
export interface UpdateGoalRequest {
  endDate?: string; // ISO 8601 date string
  targetBodyFat?: number;
  notes?: string;
}

/**
 * Response from goal creation
 */
export interface CreateGoalResponse {
  goal: Goal;
}

/**
 * Response from getting a single goal
 */
export interface GetGoalResponse {
  goal: Goal;
}

/**
 * Response from getting list of goals
 */
export interface GetGoalsResponse {
  goals: Goal[];
  total: number;
}

/**
 * Goal progress tracking data
 */
export interface GoalProgress {
  goalId: string;
  currentBodyFat: number;
  targetBodyFat: number;
  progressPercentage: number; // 0-100
  daysElapsed: number;
  daysRemaining: number;
  averageWeeklyChange: number; // Average change in body fat % per week
  projectedCompletionDate?: string; // ISO 8601 date string
  isOnTrack: boolean;
  milestones: GoalMilestone[];
}

/**
 * Milestone in goal progress
 */
export interface GoalMilestone {
  percentage: number; // 25, 50, 75, 100
  targetBodyFat: number;
  achieved: boolean;
  achievedDate?: string; // ISO 8601 date string
}

/**
 * Response from getting goal progress
 */
export interface GetGoalProgressResponse {
  progress: GoalProgress;
}

/**
 * Safety limits for goal creation
 */
export const GOAL_SAFETY_LIMITS = {
  MIN_MALE_BODY_FAT: 8, // Minimum safe body fat % for men
  MIN_FEMALE_BODY_FAT: 15, // Minimum safe body fat % for women
  MAX_BODY_FAT: 50, // Maximum reasonable body fat %
  MIN_DURATION_DAYS: 7, // Minimum goal duration
  MAX_DURATION_DAYS: 365, // Maximum goal duration (1 year)
  MAX_WEEKLY_LOSS: 1.0, // Maximum safe weekly body fat % loss
  MAX_WEEKLY_GAIN: 0.5, // Maximum reasonable weekly body fat % gain
} as const;
