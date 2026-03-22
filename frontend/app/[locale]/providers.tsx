'use client';

import { useAuthStore } from '../../lib/state/auth-store';
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(state => state.initialize);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
