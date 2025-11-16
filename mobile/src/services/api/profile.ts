/**
 * Profile API Service
 * Handles profile management operations
 */

import apiClient from './client';

/**
 * Map backend user response to frontend UserProfile
 */
const mapUserResponse = (data: any): UserProfile => {
  // Calculate age from date_of_birth
  const birthDate = new Date(data.date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear() - 
    ((today.getMonth() < birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) ? 1 : 0);

  // Map calculation method from snake_case to frontend format
  const methodMap: Record<string, UserProfile['preferredMethod']> = {
    'navy': 'NAVY',
    '3_site': 'JACKSON_POLLOCK_3',
    '7_site': 'JACKSON_POLLOCK_7',
  };

  return {
    id: data.id,
    email: data.email,
    age,
    gender: data.gender.toUpperCase() as 'MALE' | 'FEMALE',
    heightCm: parseFloat(data.height_cm),
    weightKg: 0, // Backend doesn't store current weight in user profile
    preferredMethod: methodMap[data.preferred_calculation_method] || 'NAVY',
    unitPreference: 'METRIC', // Default, can be added to backend later
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateMethodRequest,
} from '../../types/profile';

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<any>('/users/me');
  return mapUserResponse(response.data);
};

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>('/profile', data);
  return response.data;
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await apiClient.post('/profile/change-password', data);
};

/**
 * Update preferred body fat calculation method
 */
export const updateMethod = async (data: UpdateMethodRequest): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>('/profile/method', data);
  return response.data;
};

/**
 * Delete user account
 */
export const deleteAccount = async (): Promise<void> => {
  await apiClient.delete('/profile');
};
