import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { login, register, logout, getCurrentUser } from '../services/api/auth';
import { saveTokens, clearTokens, hasTokens } from '../services/storage/secureStore';
import { resetAuthState } from '../services/api/client';
import { useAuthContext } from '../contexts/AuthContext';
import { LoginRequest, RegisterRequest } from '../types/auth';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { recheckAuth } = useAuthContext();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: async (resp) => {
      console.log('[useAuth] Login successful, saving tokens...');
      await saveTokens(resp.accessToken, resp.refreshToken);
      
      // Reset the logged-out flag now that we have fresh tokens
      console.log('[useAuth] Resetting auth state...');
      resetAuthState();
      
      // fetch user profile after obtaining tokens
      try {
        console.log('[useAuth] Fetching user profile...');
        const user = await getCurrentUser();
        queryClient.setQueryData(['user'], user);
        console.log('[useAuth] User profile set:', user.email);
      } catch (e) {
        console.warn('[useAuth] Could not fetch user profile after login', e);
      }
      
      console.log('[useAuth] Notifying auth context...');
      await recheckAuth();
      
      console.log('[useAuth] Navigating to dashboard...');
      router.replace('/(tabs)');
      console.log('[useAuth] Navigation completed');
    },
    onError: (error) => {
      console.error('[useAuth] Login error:', error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    // user is the created user, variables are the original registration payload
    onSuccess: async (_user, variables) => {
      try {
        const loginResp = await login({ email: variables.email, password: variables.password });
        await saveTokens(loginResp.accessToken, loginResp.refreshToken);
        // Reset the logged-out flag after successful registration + auto-login
        resetAuthState();
        try {
          const user = await getCurrentUser();
          queryClient.setQueryData(['user'], user);
        } catch (e) {
          console.warn('Account created but user fetch failed; please refresh.');
        }
        await recheckAuth();
        router.replace('/(tabs)');
      } catch (e) {
        console.warn('Account created. Please sign in manually.');
        router.replace('/(auth)/login');
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // Clear tokens from secure storage
      await clearTokens();
      
      // Clear all cached data
      queryClient.clear();
      
      // Update auth context
      await recheckAuth();
      
      // Navigate to login
      router.replace('/(auth)/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Even if API call fails, clear local tokens
      clearTokens().then(async () => {
        queryClient.clear();
        await recheckAuth();
        router.replace('/(auth)/login');
      });
    },
  });

  // Current user query
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    enabled: true, // Fetch automatically when available
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
  });

  // Check authentication status
  const checkAuth = async () => {
    const authenticated = await hasTokens();
    return authenticated;
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    user: userQuery.data,
    isLoadingUser: userQuery.isLoading,
    refetchUser: userQuery.refetch,
    checkAuth,
  };
};
