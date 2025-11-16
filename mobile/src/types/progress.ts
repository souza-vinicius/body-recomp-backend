/**
 * Progress tracking types for weekly body composition measurements
 * and goal progress visualization
 */

export interface ProgressEntry {
  id: string;
  goalId: string;
  userId: string;
  date: string; // ISO 8601 date
  weight: number; // kg
  bodyFatPercentage: number;
  measurements?: {
    // Optional detailed measurements based on calculation method
    waist?: number;
    neck?: number;
    hip?: number;
    chest?: number;
    abdomen?: number;
    thigh?: number;
    tricep?: number;
    subscapular?: number;
    suprailiac?: number;
    midaxillary?: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgressRequest {
  goalId: string;
  date?: string; // Defaults to today if not provided
  weight: number;
  bodyFatPercentage: number;
  measurements?: {
    waist?: number;
    neck?: number;
    hip?: number;
    chest?: number;
    abdomen?: number;
    thigh?: number;
    tricep?: number;
    subscapular?: number;
    suprailiac?: number;
    midaxillary?: number;
  };
  notes?: string;
}

export interface ProgressTrend {
  goalId: string;
  entries: ProgressEntry[];
  statistics: {
    startDate: string;
    latestDate: string;
    totalEntries: number;
    averageWeeklyChange: number; // Body fat % change per week
    projectedCompletion?: string; // ISO 8601 date (null if off track)
    velocityStatus: 'on-track' | 'ahead' | 'behind'; // Compared to goal timeline
  };
  chartData: {
    dates: string[]; // X-axis values
    bodyFatPercentages: number[]; // Y-axis values
    weights: number[]; // Secondary Y-axis
    trendLine: number[]; // Linear regression
    targetLine: number[]; // Goal target
  };
}

export interface ProgressSummary {
  currentBodyFat: number;
  targetBodyFat: number;
  startingBodyFat: number;
  progressPercentage: number; // 0-100
  weeksElapsed: number;
  weeksRemaining: number;
  lastEntryDate: string;
  nextEntryDue: string; // 7 days after lastEntryDate
  canLogProgress: boolean; // True if 7+ days since last entry
  status: 'on-track' | 'ahead' | 'behind' | 'completed';
}
