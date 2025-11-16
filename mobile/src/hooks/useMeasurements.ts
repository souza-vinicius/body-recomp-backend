import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMeasurement,
  getMeasurements,
  getMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getMeasurementStats,
  getLatestMeasurement,
} from '../services/api/measurements';
import {
  CreateMeasurementRequest,
  UpdateMeasurementRequest,
  MeasurementListParams,
} from '../types/measurements';

export const useMeasurements = (params?: MeasurementListParams) => {
  const queryClient = useQueryClient();

  // Query for list of measurements
  const measurementsQuery = useQuery({
    queryKey: ['measurements', params],
    queryFn: () => getMeasurements(params),
    staleTime: 1000 * 60, // 1 minute
  });

  // Query for measurement stats
  const statsQuery = useQuery({
    queryKey: ['measurements', 'stats'],
    queryFn: getMeasurementStats,
    staleTime: 1000 * 60, // 1 minute
  });

  // Query for latest measurement
  const latestQuery = useQuery({
    queryKey: ['measurements', 'latest'],
    queryFn: getLatestMeasurement,
    staleTime: 1000 * 60, // 1 minute
  });

  // Create measurement mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateMeasurementRequest) => createMeasurement(data),
    onSuccess: () => {
      // Invalidate all measurement-related queries
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] }); // Measurements may affect goals
    },
  });

  // Update measurement mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMeasurementRequest }) =>
      updateMeasurement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  // Delete measurement mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMeasurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  return {
    // Queries
    measurements: measurementsQuery.data,
    isLoadingMeasurements: measurementsQuery.isLoading,
    measurementsError: measurementsQuery.error,
    
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    
    latestMeasurement: latestQuery.data,
    isLoadingLatest: latestQuery.isLoading,

    // Mutations
    createMeasurement: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateMeasurement: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteMeasurement: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    // Utility
    refetch: measurementsQuery.refetch,
  };
};

// Hook for single measurement
export const useMeasurement = (id: string) => {
  const query = useQuery({
    queryKey: ['measurements', id],
    queryFn: () => getMeasurement(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    measurement: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
