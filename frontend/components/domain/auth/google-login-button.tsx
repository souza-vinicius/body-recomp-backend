'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '../../../lib/state/auth-store';
import { navigateAfterAuth } from '../../../lib/auth/navigation';
import { googleLogin } from '../../../lib/api/auth';
import { ApiError } from '../../../lib/api/types';

interface GoogleLoginButtonProps {
  isLoading?: boolean;
}

export function GoogleLoginButton({ isLoading: externalLoading = false }: GoogleLoginButtonProps) {
  const t = useTranslations('Auth');
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore(state => state.setAuth);
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    setError(null);
    const { credential } = credentialResponse;
    if (!credential) return;

    try {
      const response = await googleLogin(credential);
      setAuth(response);
      await navigateAfterAuth(router);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        // User not found in DB - needs to complete registration
        // Save the sso_data and credential to sessionStorage to pick up on the next screen
        const ssoData = err.details?.sso_data || {};
        sessionStorage.setItem('sso_credential', credential);
        sessionStorage.setItem('sso_data', JSON.stringify(ssoData));
        router.push('/register/sso');
      } else {
        setError(t('google_error_failed') || 'Google Login failed');
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-12 flex justify-center overflow-hidden rounded-xl">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError(t('google_error_failed') || 'Google Login failed')}
          useOneTap
          shape="rectangular"
          theme="outline"
          text="continue_with"
          size="large"
        />
      </div>
      {error && <div className="mt-3 w-full text-red-500 text-sm p-3 bg-red-50 rounded-xl border border-red-100 font-medium">{error}</div>}
    </div>
  );
}
