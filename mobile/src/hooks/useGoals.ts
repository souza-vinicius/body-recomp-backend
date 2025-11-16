/**
 * useGoals Hook
 * React Query hooks for goal management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  cancelGoal,
  getGoalProgress,
  getActiveGoal,
} from '../services/api/goals';
import {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalProgress,
} from '../types/goals';

/**
 * Hook for managing goals with React Query
 */
export const useGoals = () => {
  const queryClient = useQueryClient();

  // Query: Get all goals
  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: () => getGoals(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query: Get active goal
  const activeGoalQuery = useQuery({
    queryKey: ['goals', 'active'],
    queryFn: async () => {
      console.log('[useGoals] Starting getActiveGoal query...');
      try {
        const result = await getActiveGoal();
        console.log('[useGoals] getActiveGoal query completed:', result);
        return result;
      } catch (error) {
        console.error('[useGoals] getActiveGoal query failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });

  // Mutation: Create goal
  const createMutation = useMutation({
    mutationFn: (data: CreateGoalRequest) => {
      if (!data.initialMeasurementId) {
        return Promise.reject(new Error('Initial measurement is required'));
      }
      return createGoal(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
    onError: (error: any) => {
      console.error('Error creating goal:', error);
    },
  });

  // Mutation: Update goal
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
      updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error: any) => {
      console.error('Error updating goal:', error);
    },
  });

  // Mutation: Cancel goal
  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error: any) => {
      console.error('Error cancelling goal:', error);
    },
  });

  console.log('[useGoals] Query states:', {
    goalsLoading: goalsQuery.isLoading,
    goalsError: goalsQuery.isError,
    activeGoalLoading: activeGoalQuery.isLoading,
    activeGoalError: activeGoalQuery.isError,
    activeGoalData: activeGoalQuery.data,
  });

  return {
    // Queries
    goals: goalsQuery.data?.goals || [],
    totalGoals: goalsQuery.data?.total || 0,
    activeGoal: activeGoalQuery.data,
    isLoading: goalsQuery.isLoading || activeGoalQuery.isLoading,
    isError: goalsQuery.isError || activeGoalQuery.isError,
    error: goalsQuery.error || activeGoalQuery.error,

    // Mutations
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    cancelGoal: cancelMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    cancelError: cancelMutation.error,

    // Refetch functions
    refetchGoals: goalsQuery.refetch,
    refetchActiveGoal: activeGoalQuery.refetch,
  };
};

/**
 * Hook for getting a specific goal by ID
 */
export const useGoal = (id: string) => {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => getGoal(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for getting goal progress
 */
export const useGoalProgress = (id: string) => {
  return useQuery({
    queryKey: ['goals', id, 'progress'],
    queryFn: () => getGoalProgress(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for progress)
  });
};
