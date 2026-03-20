'use client';

import { useAuthStore } from '../lib/state/auth-store';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
