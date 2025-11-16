import apiClient from './client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  User,
} from '../../types/auth';

/**
 * Register a new user
 */
export const register = async (data: RegisterRequest): Promise<User> => {
  // Spec: POST /api/v1/users returns a User object (no tokens)
  // Support both enveloped { data: user } and plain user responses.
  const response = await apiClient.post('/users', data);
  return response.data?.data ?? response.data;
};

/**
 * Login with email and password
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', data);
  const raw = response.data?.data ?? response.data; // tolerate envelope or plain
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    tokenType: raw.token_type,
    expiresIn: raw.expires_in,
  };
};

/**
 * Logout and invalidate refresh token
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
  refreshTokenValue: string
): Promise<RefreshTokenResponse> => {
  // Spec expects body { refresh_token }
  const response = await apiClient.post('/auth/refresh', { refresh_token: refreshTokenValue });
  const raw = response.data?.data ?? response.data;
  return {
    accessToken: raw.access_token,
    tokenType: raw.token_type,
    expiresIn: raw.expires_in,
  };
};

/**
 * Get current user profile (requires authentication)
 */
export const getCurrentUser = async () => {
  // Spec: GET /api/v1/users/me
  const response = await apiClient.get('/users/me');
  const userData = response.data?.data ?? response.data;
  
  // Ensure we always return valid data, never undefined
  if (!userData || !userData.id) {
    throw new Error('Invalid user data received from server');
  }
  
  return userData;
};
