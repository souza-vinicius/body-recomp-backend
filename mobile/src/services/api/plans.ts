/**
 * Plans API Service
 * Handles training and diet plan retrieval and regeneration
 */

import { apiClient } from './client';
import { PlansResponse, RegeneratePlanRequest, TrainingPlan, DietPlan } from '../../types/plans';

/**
 * Get training and diet plans for a goal
 */
export const getPlans = async (goalId: string): Promise<PlansResponse> => {
  const response = await apiClient.get<PlansResponse>(`/goals/${goalId}/plans`);
  return response.data;
};

/**
 * Get training plan for a goal
 */
export const getTrainingPlan = async (goalId: string): Promise<TrainingPlan | null> => {
  const response = await apiClient.get<TrainingPlan>(`/goals/${goalId}/plans/training`);
  return response.data;
};

/**
 * Get diet plan for a goal
 */
export const getDietPlan = async (goalId: string): Promise<DietPlan | null> => {
  const response = await apiClient.get<DietPlan>(`/goals/${goalId}/plans/diet`);
  return response.data;
};

/**
 * Regenerate a plan (training or diet)
 */
export const regeneratePlan = async (
  data: RegeneratePlanRequest
): Promise<TrainingPlan | DietPlan> => {
  const { goalId, planType } = data;
  const endpoint = planType === 'TRAINING' ? 'training' : 'diet';
  const response = await apiClient.post<TrainingPlan | DietPlan>(
    `/goals/${goalId}/plans/${endpoint}/regenerate`
  );
  return response.data;
};
