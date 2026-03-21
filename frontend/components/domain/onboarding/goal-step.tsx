'use client';

import { useState } from 'react';
import { Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useOnboardingStore } from '../../../lib/state/onboarding-draft-store';
import { createGoal } from '../../../lib/api/goals';
import { ApiError } from '../../../lib/api/types';
import { SelectField } from '../../forms/select-field';
import { TextField } from '../../forms/text-field';
import { SubmitButton } from '../../forms/submit-button';
import { sessionStorage } from '../../../lib/auth/session-storage';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const API_GOAL_TYPE = {
  cutting: 'CUTTING',
  bulking: 'BULKING',
} as const;

export function GoalStep({ onNext }: { onNext: () => void }) {
  const t = useTranslations('Onboarding.Steps.Goal');
  const { data, updateData, clearData } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const goalType = data.goal_type || 'cutting';
      const initialMeasurementId = data.measurement_id;

      if (!initialMeasurementId) {
        throw new Error(t('error_missing_measurement'));
      }

      if (!UUID_PATTERN.test(initialMeasurementId)) {
        throw new Error(t('error_invalid_measurement'));
      }

      const targetBodyFat = data.target_body_fat_percentage
        ? Number.parseFloat(data.target_body_fat_percentage)
        : undefined;
      const ceilingBodyFat = data.ceiling_body_fat_percentage
        ? Number.parseFloat(data.ceiling_body_fat_percentage)
        : undefined;

      const payload = {
        goal_type: API_GOAL_TYPE[goalType],
        initial_measurement_id: initialMeasurementId,
        ...(goalType === 'cutting'
          ? { target_body_fat_percentage: targetBodyFat }
          : { ceiling_body_fat_percentage: ceilingBodyFat }),
      };

      if (goalType === 'cutting') {
        if (targetBodyFat === undefined || Number.isNaN(targetBodyFat)) {
          throw new Error(t('error_invalid_target_bf'));
        }

        if (typeof data.calculated_bf === 'number' && targetBodyFat >= data.calculated_bf) {
          throw new Error(t('error_target_bf_too_high'));
        }
      }

      if (goalType === 'bulking') {
        if (ceilingBodyFat === undefined || Number.isNaN(ceilingBodyFat)) {
          throw new Error(t('error_invalid_ceiling_bf'));
        }

        if (typeof data.calculated_bf === 'number' && ceilingBodyFat <= data.calculated_bf) {
          throw new Error(t('error_ceiling_bf_too_low'));
        }
      }

      const res = await createGoal(payload);
      
      sessionStorage.setGoalId(res.id);
      clearData();
      onNext();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.details.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('error_fallback'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-surface-900 text-white p-5 rounded-xl text-center mb-6">
        <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider">{t('calculated_bf_label')}</p>
        <p className="text-4xl font-black mt-1 text-primary-400">{data.calculated_bf?.toFixed(1)}%</p>
      </div>

      <div className="flex items-center gap-2">
        <Target size={20} className="text-primary-500" />
        <h3 className="text-lg font-bold text-surface-900">{t('title')}</h3>
      </div>
      
      <SelectField 
        label={t('type_label')} 
        name="goal_type" 
        value={data.goal_type || 'cutting'} 
        onChange={e =>
          updateData({
            goal_type: e.target.value as 'cutting' | 'bulking',
            target_body_fat_percentage: e.target.value === 'cutting' ? data.target_body_fat_percentage : undefined,
            ceiling_body_fat_percentage: e.target.value === 'bulking' ? data.ceiling_body_fat_percentage : undefined,
          })
        } 
        required 
        options={[
          { label: t('Options.cutting'), value: 'cutting' },
          { label: t('Options.bulking'), value: 'bulking' }
        ]} 
      />

      {(data.goal_type === 'cutting' || !data.goal_type) && (
        <TextField 
          label={t('target_bf_label')} 
          type="number" step="0.1" 
          min="3"
          max="50"
          value={data.target_body_fat_percentage || ''} 
          onChange={e => updateData({ target_body_fat_percentage: e.target.value })} 
          required 
        />
      )}

      {data.goal_type === 'bulking' && (
        <TextField 
          label={t('ceiling_bf_label')} 
          type="number" step="0.1" 
          min="3"
          max="30"
          value={data.ceiling_body_fat_percentage || ''} 
          onChange={e => updateData({ ceiling_body_fat_percentage: e.target.value })} 
          required 
        />
      )}

      {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-100 font-medium">{error}</div>}
      
      <SubmitButton type="submit" isLoading={isLoading} className="w-full">
        {t('submit_button')}
      </SubmitButton>
    </form>
  );
}

