'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '../../forms/text-field';
import { SubmitButton } from '../../forms/submit-button';
import { login } from '../../../lib/api/auth';
import { useAuthStore } from '../../../lib/state/auth-store';
import { navigateAfterAuth } from '../../../lib/auth/navigation';

interface LoginFormProps {
  isLoading?: boolean;
  onSubmit?: (data: { email: string; password: string }) => void | Promise<void>;
}

export function LoginForm({ isLoading: externalLoading = false, onSubmit }: LoginFormProps = {}) {
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
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>}
      <SubmitButton type="submit" isLoading={isLoading || externalLoading} className="w-full">
        Sign In
      </SubmitButton>
    </form>
  );
}
