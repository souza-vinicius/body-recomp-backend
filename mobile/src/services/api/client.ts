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
    throw new Error('No refresh token available');
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
      
      // Skip token logic for refresh endpoint to avoid infinite loop
      if (requestConfig.url?.includes('/auth/refresh')) {
        console.log('[apiClient] Skipping token logic for refresh endpoint');
        return requestConfig;
      }

      const tokens = await getTokens();
      console.log('[apiClient] Tokens available:', !!tokens);
      
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
        processQueue(refreshError as Error, null);
        isRefreshing = false;
        
        // Refresh failed - clear tokens and reject
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors (network / server / unexpected)
    const isNetworkError = !error.response;
    const apiError: ApiError = {
      message:
        (error.response?.data as any)?.message ||
        (isNetworkError ? 'Network error: unable to reach server' : error.message) ||
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
