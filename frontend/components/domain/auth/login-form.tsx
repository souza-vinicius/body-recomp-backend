'use client';

import React, { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { TextField } from '../../forms/text-field';
import { SubmitButton } from '../../forms/submit-button';
import { login } from '../../../lib/api/auth';
import { useAuthStore } from '../../../lib/state/auth-store';
import { navigateAfterAuth } from '../../../lib/auth/navigation';
import { useLocale } from 'next-intl';

interface LoginFormProps {
  isLoading?: boolean;
  onSubmit?: (data: { email: string; password: string }) => void | Promise<void>;
}

export function LoginForm({ isLoading: externalLoading = false, onSubmit }: LoginFormProps = {}) {
  const t = useTranslations('Auth.Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      await onSubmit({ email, password });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokens = await login({ email, password });
      setAuth(tokens);
      await navigateAfterAuth(router);
    } catch (err: any) {
      setError(err.message || t('error_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
      <TextField
        label={t('email_label')}
        type="email"
        placeholder={t('email_placeholder')}
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
      />
      <TextField
        label={t('password_label')}
        type="password"
        placeholder={t('password_placeholder')}
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-600 text-[11px] font-bold uppercase tracking-wider p-3 bg-red-50 rounded-xl border border-red-100">{error}</div>}
      <SubmitButton type="submit" isLoading={isLoading || externalLoading} className="w-full h-12 text-sm font-black uppercase tracking-widest mt-2">
        {t('submit_button')}
      </SubmitButton>
    </form>
  );
}

