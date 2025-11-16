/**
 * Profile Tab Screen
 * Wrapper that redirects to profile/index for proper navigation
 */

import { Redirect } from 'expo-router';

export default function ProfileTab() {
  return <Redirect href="/profile" />;
}
