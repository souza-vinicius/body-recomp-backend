import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Providers } from '../../app/providers';
import { useAuthStore } from '../../lib/state/auth-store';
import { logout } from '../../lib/auth/logout';

describe('Foundation Core', () => {
  it('Providers initializes auth store', () => {
    const initSpy = vi.spyOn(useAuthStore.getState(), 'initialize');
    render(<Providers><div>Test</div></Providers>);
    expect(initSpy).toHaveBeenCalled();
  });

  it('Logout clears auth state', () => {
    useAuthStore.getState().setAuth({ access_token: '123', refresh_token: '123', token_type: 'bearer' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    
    // Setup dummy window
    const originalWindow = global.window;
    Object.defineProperty(global, 'window', {
      value: { location: { href: '' } },
      writable: true
    });

    logout();
    
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(global.window.location.href).toBe('/login');
    
    global.window = originalWindow;
  });
});
