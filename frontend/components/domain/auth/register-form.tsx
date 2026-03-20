'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '../../forms/text-field';
import { SelectField } from '../../forms/select-field';
import { SubmitButton } from '../../forms/submit-button';
import { registerUser, login } from '../../../lib/api/auth';
import { useAuthStore } from '../../../lib/state/auth-store';
import { navigateAfterAuth } from '../../../lib/auth/navigation';
import { ApiError } from '../../../lib/api/types';

interface RegisterFormProps {
  isLoading?: boolean;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}

export function RegisterForm({ isLoading: externalLoading = false, onSubmit }: RegisterFormProps = {}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    height_cm: '',
    preferred_calculation_method: 'navy',
    activity_level: 'sedentary'
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      height_cm: parseFloat(formData.height_cm),
    };

    if (onSubmit) {
      await onSubmit(payload);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await registerUser(payload);
      const tokens = await login({ email: formData.email, password: formData.password });
      setAuth(tokens);
      await navigateAfterAuth(router);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.details.detail || err.message);
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
      <TextField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
      <TextField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
      
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
        <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} required options={[
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' }
        ]} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Height (cm)" type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} required min="120" max="250" />
        <SelectField label="Activity Level" name="activity_level" value={formData.activity_level} onChange={handleChange} required options={[
          { label: 'Sedentary', value: 'sedentary' },
          { label: 'Lightly Active', value: 'lightly_active' },
          { label: 'Moderately Active', value: 'moderately_active' },
          { label: 'Very Active', value: 'very_active' },
          { label: 'Extremely Active', value: 'extremely_active' }
        ]} />
      </div>

      <SelectField label="Calc Method" name="preferred_calculation_method" value={formData.preferred_calculation_method} onChange={handleChange} required options={[
        { label: 'US Navy', value: 'navy' },
        { label: '3-Site Skinfold', value: '3_site' },
        { label: '7-Site Skinfold', value: '7_site' }
      ]} />

      {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>}
      
      <SubmitButton type="submit" isLoading={isLoading || externalLoading} className="w-full">
        Create Account
      </SubmitButton>
    </form>
  );
}
