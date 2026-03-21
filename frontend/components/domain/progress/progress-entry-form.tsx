import React, { useState } from 'react';
import { Ruler, Heart, CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Progress.Form');
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
      <div className="card overflow-hidden border border-surface-100 shadow-sm">
        <div className="px-6 py-4 bg-gradient-dark flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarDays size={18} className="text-primary-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('Sections.date_title')}</h3>
          </div>
        </div>
        <div className="p-6">
          <input
            type="date"
            value={entryDate}
            onChange={e => setEntryDate(e.target.value)}
            max={getTodayString()}
            className="w-full px-4 py-3 text-sm bg-surface-50 border-2 border-surface-200 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 focus:border-primary-500 hover:border-surface-300 font-medium"
          />
          <p className="text-[11px] text-surface-400 mt-3 font-medium flex items-center gap-1.5 uppercase tracking-tight">
            <span className="w-1 h-1 rounded-full bg-primary-500" />
            {t('Sections.date_description')}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden border border-surface-100 shadow-sm">
        <div className="px-6 py-4 bg-gradient-dark flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ruler size={18} className="text-primary-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('Sections.measurements_title')}</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <TextField
            id="weight_kg"
            name="weight_kg"
            label={t('Fields.weight_label')}
            type="number"
            step="0.1"
            required
            className="h-12"
          />

          <SelectField
            id="body_fat_method"
            name="body_fat_method"
            label={t('Fields.method_label')}
            value={method}
            onChange={(e) => setMethod(e.target.value as BodyFatMethod)}
            options={[
              { value: BodyFatMethod.NAVY, label: t('Methods.navy') },
              { value: BodyFatMethod.THREE_SITE, label: t('Methods.3_site') },
              { value: BodyFatMethod.SEVEN_SITE, label: t('Methods.7_site') },
            ]}
            className="h-12"
          />

          {method === BodyFatMethod.NAVY && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
              <TextField id="neck_cm" name="neck_cm" label={t('Fields.neck_label')} type="number" step="0.1" required />
              <TextField id="waist_cm" name="waist_cm" label={t('Fields.waist_label')} type="number" step="0.1" required />
              <TextField id="hip_cm" name="hip_cm" label={t('Fields.hip_label')} type="number" step="0.1" />
            </div>
          )}

          {method === BodyFatMethod.THREE_SITE && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">{t('Methods.skinfold_hint')}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField id="chest_mm" name="chest_mm" label={t('Fields.chest_label')} type="number" step="0.1" />
                <TextField id="abdomen_mm" name="abdomen_mm" label={t('Fields.abdomen_label')} type="number" step="0.1" />
                <TextField id="thigh_mm" name="thigh_mm" label={t('Fields.thigh_label')} type="number" step="0.1" required />
                <TextField id="tricep_mm" name="tricep_mm" label={t('Fields.tricep_label')} type="number" step="0.1" />
                <TextField id="suprailiac_mm" name="suprailiac_mm" label={t('Fields.suprailiac_label')} type="number" step="0.1" />
              </div>
            </div>
          )}

          {method === BodyFatMethod.SEVEN_SITE && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
              <TextField id="chest_mm" name="chest_mm" label={t('Fields.chest_label')} type="number" step="0.1" required />
              <TextField id="midaxillary_mm" name="midaxillary_mm" label={t('Fields.midaxillary_label')} type="number" step="0.1" required />
              <TextField id="tricep_mm" name="tricep_mm" label={t('Fields.tricep_label')} type="number" step="0.1" required />
              <TextField id="subscapular_mm" name="subscapular_mm" label={t('Fields.subscapular_label')} type="number" step="0.1" required />
              <TextField id="abdomen_mm" name="abdomen_mm" label={t('Fields.abdomen_label')} type="number" step="0.1" required />
              <TextField id="suprailiac_mm" name="suprailiac_mm" label={t('Fields.suprailiac_label')} type="number" step="0.1" required />
              <TextField id="thigh_mm" name="thigh_mm" label={t('Fields.thigh_label')} type="number" step="0.1" required />
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden border border-surface-100 shadow-sm">
        <div className="px-6 py-4 bg-gradient-dark flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart size={18} className="text-primary-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('Sections.lifestyle_title')}</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TextField id="energy_level" name="energy_level" label={t('Fields.energy_label')} type="number" step="1" min="1" max="10" />
            <TextField id="stress_level" name="stress_level" label={t('Fields.stress_label')} type="number" step="1" min="1" max="10" />
            <TextField id="sleep_quality" name="sleep_quality" label={t('Fields.sleep_label')} type="number" step="1" min="1" max="10" />
            <TextField id="adherence_percentage" name="adherence_percentage" label={t('Fields.adherence_label')} type="number" step="1" min="0" max="100" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="notes" className="text-xs font-bold text-surface-400 uppercase tracking-widest">{t('Fields.notes_label')}</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="px-4 py-3 text-sm bg-surface-50 border-2 border-surface-200 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 focus:border-primary-500 hover:border-surface-300 placeholder:text-surface-300 resize-none font-medium"
              placeholder={t('Fields.notes_placeholder')}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton isLoading={isLoading} className="w-full sm:w-auto h-12 px-10 text-sm font-black uppercase tracking-widest">
          {t('submit_button')}
        </SubmitButton>
      </div>
    </form>
  );
}


