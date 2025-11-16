/**
 * Plans Layout
 * Layout for training and diet plan screens
 */

import { Stack } from 'expo-router';

export default function PlansLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="training"
        options={{
          title: 'Training Plan',
        }}
      />
      <Stack.Screen
        name="diet"
        options={{
          title: 'Diet Plan',
        }}
      />
    </Stack>
  );
}
