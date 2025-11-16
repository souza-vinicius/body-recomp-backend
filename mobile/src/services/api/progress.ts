/**
 * Progress API service
 * Handles weekly progress tracking and trend analysis
 */

import apiClient from './client';
import { ApiResponse } from '../../types/api';
import {
  ProgressEntry,
  CreateProgressRequest,
  ProgressTrend,
  ProgressSummary,
} from '../../types/progress';

/**
 * Log a new progress entry for a goal
 */
export const logProgress = async (
  data: CreateProgressRequest
): Promise<ApiResponse<ProgressEntry>> => {
  const response = await apiClient.post<ApiResponse<ProgressEntry>>('/progress', data);
  return response.data;
};

/**
 * Get progress history for a specific goal
 */
export const getProgressHistory = async (
  goalId: string
): Promise<ProgressEntry[]> => {
  const response = await apiClient.get<ProgressEntry[]>(
    `/goals/${goalId}/progress`
  );
  return response.data;
};

/**
 * Get progress trend analysis for a goal
 * Includes statistics, chart data, and velocity tracking
 */
export const getProgressTrend = async (
  goalId: string
): Promise<ProgressTrend> => {
  const response = await apiClient.get<ProgressTrend>(
    `/goals/${goalId}/trends`
  );
  return response.data;
};

/**
 * Get progress summary for a goal
 * Includes current status, next entry due date, and progress percentage
 * Calculated from progress history
 */
export const getProgressSummary = async (
  goalId: string,
  goal: any
): Promise<ProgressSummary> => {
  // Fetch progress history to calculate summary
  const entries = await getProgressHistory(goalId);
  
  const latestEntry = entries[entries.length - 1];
  const firstEntry = entries[0];
  
  const currentBodyFat = latestEntry?.bodyFatPercentage ?? goal.currentBodyFat ?? 0;
  const startingBodyFat = goal.currentBodyFat ?? currentBodyFat;
  const targetBodyFat = goal.targetBodyFat;
  
  const currentWeight = latestEntry?.weight ?? 0;
  const startingWeight = firstEntry?.weight ?? currentWeight;
  
  // Calculate progress percentage
  const totalChange = Math.abs(startingBodyFat - targetBodyFat);
  const currentChange = Math.abs(startingBodyFat - currentBodyFat);
  const progressPercentage = totalChange > 0 ? (currentChange / totalChange) * 100 : 0;
  
  // Calculate weeks
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  const today = new Date();
  
  const weeksElapsed = Math.floor(
    (today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const totalWeeks = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const weeksRemaining = Math.max(0, totalWeeks - weeksElapsed);
  
  // Calculate next entry due date
  const lastEntryDate = latestEntry?.date ? new Date(latestEntry.date) : startDate;
  const nextEntryDue = new Date(lastEntryDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const canLogProgress = today.getTime() >= nextEntryDue.getTime();
  
  // Determine status
  let status: 'on-track' | 'ahead' | 'behind' | 'completed' = 'on-track';
  if (progressPercentage >= 100) {
    status = 'completed';
  } else if (progressPercentage > (weeksElapsed / totalWeeks) * 100) {
    status = 'ahead';
  } else if (progressPercentage < (weeksElapsed / totalWeeks) * 100 * 0.8) {
    status = 'behind';
  }
  
  return {
    currentBodyFat,
    targetBodyFat,
    startingBodyFat,
    currentWeight,
    startingWeight,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    weeksElapsed,
    weeksRemaining,
    totalWeeks,
    lastEntryDate: lastEntryDate.toISOString(),
    nextEntryDue: nextEntryDue.toISOString(),
    canLogProgress,
    status,
  };
};

/**
 * Get a specific progress entry by ID
 */
export const getProgressEntry = async (
  entryId: string
): Promise<ApiResponse<ProgressEntry>> => {
  const response = await apiClient.get<ApiResponse<ProgressEntry>>(
    `/progress/${entryId}`
  );
  return response.data;
};

/**
 * Update a progress entry
 */
export const updateProgressEntry = async (
  entryId: string,
  data: Partial<CreateProgressRequest>
): Promise<ApiResponse<ProgressEntry>> => {
  const response = await apiClient.put<ApiResponse<ProgressEntry>>(
    `/progress/${entryId}`,
    data
  );
  return response.data;
};

/**
 * Delete a progress entry
 */
export const deleteProgressEntry = async (entryId: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/progress/${entryId}`);
  return response.data;
};
