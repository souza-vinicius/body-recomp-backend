/**
 * React Query hooks for progress tracking
 */

import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  logProgress,
  getProgressHistory,
  getProgressTrend,
  getProgressSummary,
  getProgressEntry,
  updateProgressEntry,
  deleteProgressEntry,
} from '../services/api/progress';
import {
  ProgressEntry,
  CreateProgressRequest,
  ProgressTrend,
  ProgressSummary,
} from '../types/progress';
import { ApiResponse } from '../types/api';

/**
 * Query key factory for progress-related queries
 */
export const progressKeys = {
  all: ['progress'] as const,
  lists: () => [...progressKeys.all, 'list'] as const,
  list: (goalId: string) => [...progressKeys.lists(), goalId] as const,
  details: () => [...progressKeys.all, 'detail'] as const,
  detail: (entryId: string) => [...progressKeys.details(), entryId] as const,
  trend: (goalId: string) => [...progressKeys.all, 'trend', goalId] as const,
  summary: (goalId: string) => [...progressKeys.all, 'summary', goalId] as const,
};

/**
 * Hook to get progress history for a goal
 */
export const useProgressHistory = (
  goalId: string,
  enabled = true
): UseQueryResult<ProgressEntry[], Error> => {
  return useQuery({
    queryKey: progressKeys.list(goalId),
    queryFn: async () => {
      const response = await getProgressHistory(goalId);
      return response.data;
    },
    enabled: enabled && !!goalId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get progress trend analysis for a goal
 */
export const useProgressTrend = (
  goalId: string,
  enabled = true
): UseQueryResult<ProgressTrend, Error> => {
  return useQuery({
    queryKey: progressKeys.trend(goalId),
    queryFn: async () => {
      const response = await getProgressTrend(goalId);
      return response.data;
    },
    enabled: enabled && !!goalId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get progress summary for a goal
 */
export const useProgressSummary = (
  goalId: string,
  enabled = true
): UseQueryResult<ProgressSummary, Error> => {
  return useQuery({
    queryKey: progressKeys.summary(goalId),
    queryFn: async () => {
      const response = await getProgressSummary(goalId);
      return response.data;
    },
    enabled: enabled && !!goalId,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to get a specific progress entry
 */
export const useProgressEntry = (
  entryId: string,
  enabled = true
): UseQueryResult<ProgressEntry, Error> => {
  return useQuery({
    queryKey: progressKeys.detail(entryId),
    queryFn: async () => {
      const response = await getProgressEntry(entryId);
      return response.data;
    },
    enabled: enabled && !!entryId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to log new progress
 */
export const useLogProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgressRequest) => logProgress(data),
    onSuccess: (response, variables) => {
      const { goalId } = variables;

      // Invalidate all progress-related queries for this goal
      queryClient.invalidateQueries({ queryKey: progressKeys.list(goalId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.trend(goalId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.summary(goalId) });

      // Also invalidate goal queries since progress affects goal status
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('Progress logging error:', error);
      }
    },
  });
};

/**
 * Hook to update a progress entry
 */
export const useUpdateProgressEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: Partial<CreateProgressRequest> }) =>
      updateProgressEntry(entryId, data),
    onSuccess: (response, variables) => {
      const entry = response.data;

      // Invalidate specific entry
      queryClient.invalidateQueries({ queryKey: progressKeys.detail(variables.entryId) });

      // Invalidate goal progress queries
      queryClient.invalidateQueries({ queryKey: progressKeys.list(entry.goalId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.trend(entry.goalId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.summary(entry.goalId) });
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('Progress update error:', error);
      }
    },
  });
};

/**
 * Hook to delete a progress entry
 */
export const useDeleteProgressEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => deleteProgressEntry(entryId),
    onSuccess: (_, entryId) => {
      // Invalidate entry detail
      queryClient.invalidateQueries({ queryKey: progressKeys.detail(entryId) });

      // Invalidate all progress lists (we don't know which goal it belonged to)
      queryClient.invalidateQueries({ queryKey: progressKeys.lists() });
      queryClient.invalidateQueries({ queryKey: progressKeys.all });

      // Invalidate goal queries
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('Progress deletion error:', error);
      }
    },
  });
};
