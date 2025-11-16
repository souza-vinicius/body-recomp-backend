/**
 * Profile Hooks
 * React Query hooks for profile data management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateMethodRequest,
} from '../types/profile';
import * as profileApi from '../services/api/profile';

// Query key factory
export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

/**
 * Get current user profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (updatedProfile: UserProfile) => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.detail(), updatedProfile);
      
      // Invalidate related queries that might depend on profile data
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

/**
 * Change user password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileApi.changePassword(data),
  });
};

/**
 * Update preferred body fat calculation method
 */
export const useUpdateMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMethodRequest) => profileApi.updateMethod(data),
    onSuccess: (updatedProfile: UserProfile) => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.detail(), updatedProfile);
      
      // Invalidate measurements since calculation method affects future measurements
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
  });
};

/**
 * Delete user account
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.deleteAccount,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};
