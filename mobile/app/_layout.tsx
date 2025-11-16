import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '../src/constants/theme';
import { AuthProvider, useAuthContext } from '../src/contexts/AuthContext';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GluestackUIProvider config={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
