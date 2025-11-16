import { NavigationProp } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  login: undefined;
  register: undefined;
};

// Tabs Stack
export type TabsParamList = {
  index: undefined; // Dashboard
  measurements: undefined;
  goals: undefined;
  progress: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  index: undefined; // Profile home
  edit: undefined;
  settings: undefined;
};

// Root navigation types
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'profile': undefined;
};

// Navigation prop types for screens
export type AuthNavigationProp = NavigationProp<AuthStackParamList>;
export type TabsNavigationProp = NavigationProp<TabsParamList>;
export type ProfileNavigationProp = NavigationProp<ProfileStackParamList>;
export type RootNavigationProp = NavigationProp<RootStackParamList>;
