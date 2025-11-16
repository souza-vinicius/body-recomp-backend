import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { login, register, logout, getCurrentUser } from '../services/api/auth';
import { saveTokens, clearTokens, hasTokens } from '../services/storage/secureStore';
import { LoginRequest, RegisterRequest } from '../types/auth';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: async (resp) => {
      await saveTokens(resp.accessToken, resp.refreshToken);
      // fetch user profile after obtaining tokens
      try {
        const user = await getCurrentUser();
        queryClient.setQueryData(['user'], user);
      } catch (e) {
        console.warn('Could not fetch user profile after login');
      }
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('Login error:', error);
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
        try {
          const user = await getCurrentUser();
          queryClient.setQueryData(['user'], user);
        } catch (e) {
          console.warn('Account created but user fetch failed; please refresh.');
        }
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
      
      // Navigate to login
      router.replace('/(auth)/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Even if API call fails, clear local tokens
      clearTokens().then(() => {
        queryClient.clear();
        router.replace('/(auth)/login');
      });
    },
  });

  // Current user query
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    enabled: false, // Only fetch when explicitly requested
    staleTime: 5 * 60 * 1000, // 5 minutes
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
