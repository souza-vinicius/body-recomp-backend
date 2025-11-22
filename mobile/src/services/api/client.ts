import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../../constants/config';
import { getTokens, saveTokens, clearTokens } from '../storage/secureStore';
import { ApiResponse, ApiError } from '../../types/api';
import { refreshToken as refreshTokenAPI } from './auth';

// Create Axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// When refresh fails because user has logged out (no refresh token), set this
let isLoggedOut = false;

// Reset logged out flag (call this when user successfully logs in)
export const resetAuthState = () => {
  isLoggedOut = false;
  tokenExpiration = null;
};

// Track token expiration
let tokenExpiration: Date | null = null;

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setTokenExpiration = (expiresIn: number) => {
  tokenExpiration = new Date(Date.now() + expiresIn * 1000);
};

const isTokenExpired = (): boolean => {
  return tokenExpiration ? tokenExpiration.getTime() <= new Date().getTime() : true;
};

// Centralized refresh logic
const refreshAccessToken = async (): Promise<string> => {
  const tokens = await getTokens();
  if (!tokens?.refreshToken) {
    // Mark as logged out so we don't repeatedly attempt refresh
    isLoggedOut = true;
    throw new Error('User logged out');
  }

  const refreshResponse = await refreshTokenAPI(tokens.refreshToken);
  await saveTokens(refreshResponse.accessToken, tokens.refreshToken);
  setTokenExpiration(refreshResponse.expiresIn);
  return refreshResponse.accessToken;
};

// Request interceptor: Inject JWT token
apiClient.interceptors.request.use(
  async (requestConfig) => {
    try {
      console.log('[apiClient] Request to:', requestConfig.url);

      // Skip auth checks for public endpoints (login, register, refresh)
      const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/users'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => requestConfig.url?.includes(endpoint));
      
      if (isPublicEndpoint) {
        console.log('[apiClient] Public endpoint, skipping auth checks');
        return requestConfig;
      }

      // Check for tokens BEFORE checking isLoggedOut flag
      // This handles the race condition where user just logged in
      const tokens = await getTokens();
      console.log('[apiClient] Tokens available:', !!tokens);

      // If we have valid tokens, clear the logged-out flag
      // (user has successfully logged in, even if flag was previously set)
      if (tokens?.accessToken && isLoggedOut) {
        console.log('[apiClient] Tokens found after login, clearing logged-out flag');
        isLoggedOut = false;
      }

      // NOW check if user is logged out (after clearing flag if tokens exist)
      if (isLoggedOut) {
        console.log('[apiClient] Aborting request: user logged out');
        return Promise.reject(new Error('User logged out'));
      }

      if (!tokens?.accessToken) {
        console.log('[apiClient] No access token available');
        return requestConfig;
      }

      // Check if token is expired and refresh if needed
      if (isTokenExpired()) {
        console.log('[apiClient] Token expired, refreshing...');
        const newAccessToken = await refreshAccessToken();
        if (requestConfig.headers) {
          requestConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        }
      } else {
        // Use existing token
        console.log('[apiClient] Using existing token');
        if (requestConfig.headers) {
          requestConfig.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
      }
      
      return requestConfig;
    } catch (error) {
      console.error('[apiClient] Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('[apiClient] Request interceptor rejection:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Successful response - return data
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Special-case: our request interceptor may abort with a synthetic
    // "User logged out" error when there are no tokens. Treat this as a
    // clean auth error instead of a misleading network error.
    if (error.message === 'User logged out') {
      const apiError: ApiError = {
        message: 'User is logged out',
        statusCode: 401,
        errors: undefined,
      };

      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[apiClient] Auth error (logged out):', apiError);
      }

      return Promise.reject(apiError);
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const accessToken = await refreshAccessToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        processQueue(null, accessToken);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh failed because user is logged out, the error message
        // is now 'User logged out' and isLoggedOut is already set in refreshAccessToken.
        processQueue(refreshError as Error, null);
        isRefreshing = false;

        // Refresh failed - clear tokens and reject
        try {
          await clearTokens();
        } catch (e) {
          console.warn('[apiClient] clearTokens failed', e);
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other errors (network / server / unexpected)
    const isNetworkError = !error.response;
    const apiError: ApiError = {
      message:
        (error.response?.data as any)?.message ||
        (isNetworkError ? `Network error: unable to reach server ${config.API_BASE_URL}` : error.message) ||
        'An unexpected error occurred',
      statusCode: error.response?.status || (isNetworkError ? 0 : 500),
      errors: (error.response?.data as any)?.errors,
    };

    // Structured debug logging (safe + defensive)
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const logPayload = {
        message: apiError.message,
        statusCode: apiError.statusCode,
        errors: apiError.errors ?? null,
        network: isNetworkError,
        url: error.config?.url,
        method: error.config?.method,
        originalMessage: error.message,
      };
      // Use warn for common client errors (404/400), error for server/unknown/network issues
      if (apiError.statusCode === 404 || apiError.statusCode === 400) {
        console.warn('API Client Error:', logPayload);
      } else if (apiError.statusCode >= 500 || isNetworkError) {
        console.error('API Server/Network Error:', logPayload);
      } else {
        console.log('API Error:', logPayload);
      }
    }

    // Provide clearer not found message mapping
    if (apiError.statusCode === 404 && !apiError.message) {
      apiError.message = 'Resource not found';
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
