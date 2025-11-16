/**
 * usePlans Hook
 * React Query hooks for training and diet plans
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPlans,
  getTrainingPlan,
  getDietPlan,
  regeneratePlan,
} from '../services/api/plans';
import { RegeneratePlanRequest } from '../types/plans';

/**
 * Query keys factory for plans
 */
export const plansKeys = {
  all: ['plans'] as const,
  byGoal: (goalId: string) => [...plansKeys.all, goalId] as const,
  training: (goalId: string) => [...plansKeys.byGoal(goalId), 'training'] as const,
  diet: (goalId: string) => [...plansKeys.byGoal(goalId), 'diet'] as const,
};

/**
 * Hook to get all plans (training and diet) for a goal
 */
export const usePlans = (goalId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: plansKeys.byGoal(goalId),
    queryFn: () => getPlans(goalId),
    enabled: !!goalId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get training plan for a goal
 */
export const useTrainingPlan = (goalId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: plansKeys.training(goalId),
    queryFn: () => getTrainingPlan(goalId),
    enabled: !!goalId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get diet plan for a goal
 */
export const useDietPlan = (goalId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: plansKeys.diet(goalId),
    queryFn: () => getDietPlan(goalId),
    enabled: !!goalId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to regenerate a plan
 */
export const useRegeneratePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegeneratePlanRequest) => regeneratePlan(data),
    onSuccess: (_, variables) => {
      // Invalidate plans queries to refetch
      queryClient.invalidateQueries({ queryKey: plansKeys.byGoal(variables.goalId) });
      if (variables.planType === 'TRAINING') {
        queryClient.invalidateQueries({ queryKey: plansKeys.training(variables.goalId) });
      } else {
        queryClient.invalidateQueries({ queryKey: plansKeys.diet(variables.goalId) });
      }
    },
    onError: (error: any) => {
      console.error('Error regenerating plan:', error);
    },
  });
};
