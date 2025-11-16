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
): Promise<ApiResponse<ProgressEntry[]>> => {
  const response = await apiClient.get<ApiResponse<ProgressEntry[]>>(
    `/progress/goal/${goalId}`
  );
  return response.data;
};

/**
 * Get progress trend analysis for a goal
 * Includes statistics, chart data, and velocity tracking
 */
export const getProgressTrend = async (
  goalId: string
): Promise<ApiResponse<ProgressTrend>> => {
  const response = await apiClient.get<ApiResponse<ProgressTrend>>(
    `/progress/goal/${goalId}/trend`
  );
  return response.data;
};

/**
 * Get progress summary for a goal
 * Includes current status, next entry due date, and progress percentage
 */
export const getProgressSummary = async (
  goalId: string
): Promise<ApiResponse<ProgressSummary>> => {
  const response = await apiClient.get<ApiResponse<ProgressSummary>>(
    `/progress/goal/${goalId}/summary`
  );
  return response.data;
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
