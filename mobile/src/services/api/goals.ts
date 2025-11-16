/**
 * Goal API Service
 * Handles API requests for body recomposition goals (cutting/bulking)
 */

import apiClient from './client';
import {
  Goal,
  CreateGoalRequest,
  GetGoalsResponse,
  UpdateGoalRequest,
  GoalProgress,
  GetGoalProgressResponse,
  GoalType,
} from '../../types/goals';

/**
 * Transform snake_case API response to camelCase Goal
 */
const mapGoalResponse = (apiGoal: any): Goal => ({
  id: apiGoal.id,
  userId: apiGoal.user_id,
  type: apiGoal.goal_type,
  status: apiGoal.status,
  startDate: apiGoal.started_at,
  endDate: apiGoal.estimated_weeks_to_goal
    ? new Date(
        new Date(apiGoal.started_at).getTime() +
          apiGoal.estimated_weeks_to_goal * 7 * 24 * 60 * 60 * 1000
      ).toISOString()
    : new Date(
        new Date(apiGoal.started_at).getTime() + 90 * 24 * 60 * 60 * 1000
      ).toISOString(), // Default 90 days
  currentBodyFat: apiGoal.current_body_fat_percentage,
  targetBodyFat:
    apiGoal.target_body_fat_percentage || apiGoal.ceiling_body_fat_percentage,
  recommendedCalories: apiGoal.target_calories,
  weeklyDeficitOrSurplus: 0, // Not provided by current API
  notes: undefined, // Not provided by current API
  createdAt: apiGoal.created_at,
  updatedAt: apiGoal.updated_at,
  completedAt: apiGoal.completed_at,
});

/**
 * Create a new goal
 * @param data - Goal creation data
 * @returns Promise resolving to created goal
 */
// Adapter: transform CreateGoalRequest into backend payload
export const createGoal = async (data: CreateGoalRequest): Promise<Goal> => {
  // Backend expects goal_type, initial_measurement_id and either target_body_fat_percentage OR ceiling_body_fat_percentage
  const payload: Record<string, any> = {
    goal_type: data.type === GoalType.CUTTING ? 'CUTTING' : 'BULKING',
    initial_measurement_id: data.initialMeasurementId,
  };
  if (data.type === GoalType.CUTTING) {
    payload.target_body_fat_percentage = data.targetBodyFat;
  } else {
    payload.ceiling_body_fat_percentage = data.targetBodyFat; // reused field name from form
  }
  
  console.log('[createGoal] Sending payload:', payload);
  const response = await apiClient.post<any>('/goals', payload);
  console.log('[createGoal] Response received:', response.data);
  return mapGoalResponse(response.data);
};

/**
 * Get all goals for the authenticated user
 * @param params - Optional query parameters
 * @returns Promise resolving to list of goals
 */
export const getGoals = async (params?: {
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  type?: 'CUTTING' | 'BULKING';
  limit?: number;
  offset?: number;
}): Promise<GetGoalsResponse> => {
  try {
    console.log('[getGoals] Starting request with params:', params);
    // Backend returns list[GoalResponse] directly (not wrapped in { goals, total })
    const response = await apiClient.get<any[]>('/goals', { params });
    console.log('[getGoals] Response received:', response.data);
    const goals = response.data.map(mapGoalResponse);
    console.log('[getGoals] Goals mapped:', goals);
    
    // Wrap in expected format for consistency with hook expectations
    return {
      goals,
      total: goals.length,
    };
  } catch (error) {
    console.error('[getGoals] Error:', error);
    throw error;
  }
};

/**
 * Get a specific goal by ID
 * @param id - Goal ID
 * @returns Promise resolving to goal details
 */
export const getGoal = async (id: string): Promise<Goal> => {
  const response = await apiClient.get<any>(`/goals/${id}`);
  return mapGoalResponse(response.data);
};

/**
 * Update an existing goal
 * @param id - Goal ID
 * @param data - Goal update data
 * @returns Promise resolving to updated goal
 */
export const updateGoal = async (id: string, data: UpdateGoalRequest): Promise<Goal> => {
  const response = await apiClient.put<any>(`/goals/${id}`, data);
  return mapGoalResponse(response.data);
};

/**
 * Cancel an active goal
 * @param id - Goal ID
 * @returns Promise resolving to cancelled goal
 */
export const cancelGoal = async (id: string): Promise<Goal> => {
  const response = await apiClient.post<any>(`/goals/${id}/cancel`);
  return mapGoalResponse(response.data);
};

/**
 * Get progress for a specific goal
 * @param id - Goal ID
 * @returns Promise resolving to goal progress data
 */
export const getGoalProgress = async (id: string): Promise<GoalProgress> => {
  const response = await apiClient.get<GetGoalProgressResponse>(`/goals/${id}/progress`);
  return response.data.progress;
};

/**
 * Get the current active goal for the user
 * @returns Promise resolving to active goal or null if none exists
 */
export const getActiveGoal = async (): Promise<Goal | null> => {
  try {
    console.log('[getActiveGoal] Fetching active goal...');
    const response = await getGoals({ status: 'ACTIVE', limit: 1 });
    console.log('[getActiveGoal] Response:', response);
    const goal = response.goals.length > 0 ? response.goals[0] : null;
    console.log('[getActiveGoal] Active goal:', goal);
    return goal;
  } catch (error: any) {
    console.log('[getActiveGoal] Error caught:', error);
    // Treat 404/405 or empty response as "no active goal"
    const status = error?.response?.status || error?.statusCode;
    if (status === 404 || status === 405) {
      console.warn('[getActiveGoal] Endpoint returned', status, '- treating as no active goal');
      return null;
    }
    console.error('[getActiveGoal] Unexpected error:', error);
    // Return null on any error to allow UI to render "no goal" state
    return null;
  }
};
