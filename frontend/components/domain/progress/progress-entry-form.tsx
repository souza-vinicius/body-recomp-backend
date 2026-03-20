import React, { useState } from 'react';
import { Ruler, Heart, CalendarDays } from 'lucide-react';
import { BodyFatMethod } from '@/lib/api/types';
import { TextField } from '@/components/forms/text-field';
import { SelectField } from '@/components/forms/select-field';
import { SubmitButton } from '@/components/forms/submit-button';

interface ProgressEntryFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  initialMethod?: BodyFatMethod;
}

function getTodayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function ProgressEntryForm({ onSubmit, isLoading, initialMethod = BodyFatMethod.NAVY }: ProgressEntryFormProps) {
  const [method, setMethod] = useState<BodyFatMethod>(initialMethod);
  const [entryDate, setEntryDate] = useState(getTodayString());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = { body_fat_method: method };

    [
      'weight_kg',
      'neck_cm', 'waist_cm', 'hip_cm',
      'chest_mm', 'abdomen_mm', 'thigh_mm',
      'tricep_mm', 'suprailiac_mm', 'midaxillary_mm', 'subscapular_mm',
      'energy_level', 'stress_level', 'sleep_quality', 'adherence_percentage',
    ].forEach(key => {
      const val = formData.get(key);
      if (val) data[key] = parseFloat(val as string);
    });

    data.notes = formData.get('notes') as string || '';
    data.logged_at = entryDate;

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date picker card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-3 bg-gradient-dark flex items-center gap-2">
          <CalendarDays size={16} className="text-primary-400" />
          <h3 className="text-sm font-bold text-white">Entry Date</h3>
        </div>
        <div className="p-6">
          <input
            type="date"
            value={entryDate}
            onChange={e => setEntryDate(e.target.value)}
            max={getTodayString()}
            className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-surface-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-0 focus:border-primary-500 hover:border-surface-300"
          />
          <p className="text-xs text-surface-400 mt-2">
            If an entry already exists for this date, it will be replaced.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-3 bg-gradient-dark flex items-center gap-2">
          <Ruler size={16} className="text-primary-400" />
          <h3 className="text-sm font-bold text-white">Body Measurements</h3>
        </div>
        <div className="p-6 space-y-4">
          <TextField
            id="weight_kg"
            name="weight_kg"
            label="Weight (kg)"
            type="number"
            step="0.1"
            required
          />

          <SelectField
            id="body_fat_method"
            name="body_fat_method"
            label="Body Fat Measurement Method"
            value={method}
            onChange={(e) => setMethod(e.target.value as BodyFatMethod)}
            options={[
              { value: BodyFatMethod.NAVY, label: 'US Navy Tape' },
              { value: BodyFatMethod.THREE_SITE, label: 'Skinfold (3-site)' },
              { value: BodyFatMethod.SEVEN_SITE, label: 'Skinfold (7-site)' },
            ]}
          />

          {method === BodyFatMethod.NAVY && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField id="neck_cm" name="neck_cm" label="Neck (cm)" type="number" step="0.1" required />
              <TextField id="waist_cm" name="waist_cm" label="Waist (cm)" type="number" step="0.1" required />
              <TextField id="hip_cm" name="hip_cm" label="Hip (cm) – Optional" type="number" step="0.1" />
            </div>
          )}

          {method === BodyFatMethod.THREE_SITE && (
            <div className="space-y-3">
              <p className="text-sm text-surface-400">Male: chest, abdomen, thigh. Female: tricep, suprailiac, thigh.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField id="chest_mm" name="chest_mm" label="Chest (mm)" type="number" step="0.1" />
                <TextField id="abdomen_mm" name="abdomen_mm" label="Abdomen (mm)" type="number" step="0.1" />
                <TextField id="thigh_mm" name="thigh_mm" label="Thigh (mm)" type="number" step="0.1" required />
                <TextField id="tricep_mm" name="tricep_mm" label="Tricep (mm)" type="number" step="0.1" />
                <TextField id="suprailiac_mm" name="suprailiac_mm" label="Suprailiac (mm)" type="number" step="0.1" />
              </div>
            </div>
          )}

          {method === BodyFatMethod.SEVEN_SITE && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TextField id="chest_mm" name="chest_mm" label="Chest (mm)" type="number" step="0.1" required />
              <TextField id="midaxillary_mm" name="midaxillary_mm" label="Midaxillary (mm)" type="number" step="0.1" required />
              <TextField id="tricep_mm" name="tricep_mm" label="Tricep (mm)" type="number" step="0.1" required />
              <TextField id="subscapular_mm" name="subscapular_mm" label="Subscapular (mm)" type="number" step="0.1" required />
              <TextField id="abdomen_mm" name="abdomen_mm" label="Abdomen (mm)" type="number" step="0.1" required />
              <TextField id="suprailiac_mm" name="suprailiac_mm" label="Suprailiac (mm)" type="number" step="0.1" required />
              <TextField id="thigh_mm" name="thigh_mm" label="Thigh (mm)" type="number" step="0.1" required />
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-3 bg-gradient-dark flex items-center gap-2">
          <Heart size={16} className="text-primary-400" />
          <h3 className="text-sm font-bold text-white">Lifestyle & Habits</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField id="energy_level" name="energy_level" label="Energy Level (1-10)" type="number" step="1" min="1" max="10" />
            <TextField id="stress_level" name="stress_level" label="Stress Level (1-10)" type="number" step="1" min="1" max="10" />
            <TextField id="sleep_quality" name="sleep_quality" label="Sleep Quality (1-10)" type="number" step="1" min="1" max="10" />
            <TextField id="adherence_percentage" name="adherence_percentage" label="Diet Adherence %" type="number" step="1" min="0" max="100" />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-sm font-semibold text-surface-700">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="px-3.5 py-2.5 text-sm bg-white border-2 border-surface-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-0 focus:border-primary-500 hover:border-surface-300 placeholder:text-surface-300 resize-none"
              placeholder="How did you feel this week?"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton isLoading={isLoading} className="w-full sm:w-auto">Log Progress</SubmitButton>
      </div>
    </form>
  );
}

