'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { TextField } from '../../forms/text-field';
import { SelectField } from '../../forms/select-field';
import { SubmitButton } from '../../forms/submit-button';
import { googleRegister } from '../../../lib/api/auth';
import { useAuthStore } from '../../../lib/state/auth-store';
import { navigateAfterAuth } from '../../../lib/auth/navigation';
import { ApiError } from '../../../lib/api/types';

export function SsoRegisterForm() {
  const t = useTranslations('Auth.Register');
  const [formData, setFormData] = useState({
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
  
  const [ssoData, setSsoData] = useState<any>(null);
  const [credential, setCredential] = useState<string | null>(null);

  useEffect(() => {
    // Load SSO details from sessionStorage
    const storedCredential = sessionStorage.getItem('sso_credential');
    const storedData = sessionStorage.getItem('sso_data');
    if (storedCredential) setCredential(storedCredential);
    if (storedData) {
      try {
        setSsoData(JSON.parse(storedData));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credential) {
      setError(t('error_failed') || 'Missing Google credentials. Please try logging in again.');
      return;
    }

    const payload = {
      credential,
      ...formData,
      height_cm: parseFloat(formData.height_cm),
    };

    setIsLoading(true);
    setError(null);

    try {
      const tokens = await googleRegister(payload);
      setAuth(tokens);
      sessionStorage.removeItem('sso_credential');
      sessionStorage.removeItem('sso_data');
      await navigateAfterAuth(router);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.details.detail || err.message);
      } else {
        setError(err.message || t('error_failed'));
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
      {ssoData?.name && (
        <div className="mb-4 text-center">
          <p className="text-surface-600 font-medium">Conta detectada para:</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            {ssoData.picture && <img src={ssoData.picture} alt="Profile" className="w-8 h-8 rounded-full shadow-sm" />}
            <p className="text-sm font-bold text-surface-900">{ssoData.name}</p>
          </div>
          <p className="text-xs text-surface-400 mt-1">{ssoData.email}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <TextField label={t('dob_label')} type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
        <SelectField label={t('gender_label')} name="gender" value={formData.gender} onChange={handleChange} required options={[
          { label: t('Genders.male'), value: 'male' },
          { label: t('Genders.female'), value: 'female' }
        ]} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <TextField label={t('height_label')} type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} required min="120" max="250" />
        <SelectField label={t('activity_label')} name="activity_level" value={formData.activity_level} onChange={handleChange} required options={[
          { label: t('ActivityLevels.sedentary'), value: 'sedentary' },
          { label: t('ActivityLevels.lightly_active'), value: 'lightly_active' },
          { label: t('ActivityLevels.moderately_active'), value: 'moderately_active' },
          { label: t('ActivityLevels.very_active'), value: 'very_active' },
          { label: t('ActivityLevels.extremely_active'), value: 'extremely_active' }
        ]} />
      </div>

      <SelectField label={t('method_label')} name="preferred_calculation_method" value={formData.preferred_calculation_method} onChange={handleChange} required options={[
        { label: t('Methods.navy'), value: 'navy' },
        { label: t('Methods.3_site'), value: '3_site' },
        { label: t('Methods.7_site'), value: '7_site' }
      ]} />

      {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-xl border border-red-100 font-medium">{error}</div>}
      
      <SubmitButton type="submit" isLoading={isLoading} className="w-full h-12 text-sm font-black uppercase tracking-widest mt-2">
        Finalizar Cadastro
      </SubmitButton>
    </form>
  );
}
