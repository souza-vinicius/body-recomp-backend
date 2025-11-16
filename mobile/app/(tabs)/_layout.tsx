import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hasTokens } from '../../src/services/storage/secureStore';

export default function TabsLayout() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      const authenticated = await hasTokens();
      if (!authenticated) {
        router.replace('/(auth)/login');
      }
    };
    checkAuth();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          title: 'Measurements',
          tabBarIcon: ({ color }) => <TabBarIcon name="scale" color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <TabBarIcon name="target" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabBarIcon name="chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Placeholder icon component - replace with actual icon library
function TabBarIcon({ name, color }: { name: string; color: string }) {
  return null; // TODO: Implement with @expo/vector-icons
}
