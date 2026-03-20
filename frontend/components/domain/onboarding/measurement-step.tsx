'use client';

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { useOnboardingStore } from '../../../lib/state/onboarding-draft-store';
import { createMeasurement } from '../../../lib/api/measurements';
import { TextField } from '../../forms/text-field';
import { SubmitButton } from '../../forms/submit-button';

export function MeasurementStep({ onNext }: { onNext: () => void }) {
  const { data, updateData } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        weight_kg: parseFloat(data.weight_kg),
        calculation_method: 'navy',
        measured_at: new Date().toISOString(),
        neck_cm: data.neck_cm ? parseFloat(data.neck_cm) : undefined,
        waist_cm: data.waist_cm ? parseFloat(data.waist_cm) : undefined,
        hip_cm: data.hip_cm ? parseFloat(data.hip_cm) : undefined,
      };

      const res = await createMeasurement(payload);
      
      updateData({ 
        measurement_id: res.id, 
        calculated_bf: res.calculated_body_fat_percentage 
      });
      
      onNext();
    } catch (err: any) {
      setError(err.message || 'Failed to save measurement. Check values.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2">
        <Ruler size={20} className="text-primary-500" />
        <h3 className="text-lg font-bold text-surface-900">Initial Measurement</h3>
      </div>

      <TextField 
        label="Weight (kg)" 
        type="number" step="0.1" 
        value={data.weight_kg} 
        onChange={e => updateData({ weight_kg: e.target.value })} 
        required 
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField 
          label="Waist (cm)" 
          type="number" step="0.1" 
          value={data.waist_cm || ''} 
          onChange={e => updateData({ waist_cm: e.target.value })} 
        />
        <TextField 
          label="Neck (cm)" 
          type="number" step="0.1" 
          value={data.neck_cm || ''} 
          onChange={e => updateData({ neck_cm: e.target.value })} 
        />
      </div>
      <TextField 
        label="Hip (cm) - Female only" 
        type="number" step="0.1" 
        value={data.hip_cm || ''} 
        onChange={e => updateData({ hip_cm: e.target.value })} 
      />

      {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-100 font-medium">{error}</div>}
      
      <SubmitButton type="submit" isLoading={isLoading} className="w-full">
        Calculate Body Fat
      </SubmitButton>
    </form>
  );
}
