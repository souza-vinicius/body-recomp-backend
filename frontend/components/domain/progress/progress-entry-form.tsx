import React, { useState } from 'react';
import { Ruler, Heart, CalendarDays, Activity, Moon, Zap, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BodyFatMethod } from '@/lib/api/types';
import { SelectField } from '@/components/forms/select-field';
import { HorizontalDatePicker } from '@/components/forms/horizontal-date-picker';

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
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'good' | 'elite'>('good');
  const [energyLevel, setEnergyLevel] = useState(8);
  const [stressLevel, setStressLevel] = useState(3);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = { body_fat_method: method };

    [
      'weight_kg',
      'neck_cm', 'waist_cm', 'hip_cm',
      'chest_mm', 'abdomen_mm', 'thigh_mm',
      'tricep_mm', 'suprailiac_mm', 'midaxillary_mm', 'subscapular_mm',
    ].forEach(key => {
      const val = formData.get(key);
      if (val) data[key] = parseFloat(val as string);
    });

    data.energy_level = energyLevel;
    data.stress_level = stressLevel;
    data.sleep_quality = sleepQuality === 'poor' ? 3 : sleepQuality === 'good' ? 7 : 10;
    data.notes = formData.get('notes') as string || '';
    data.logged_at = entryDate;

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <HorizontalDatePicker value={entryDate} onChange={setEntryDate} />

      <section className="grid grid-cols-2 gap-4">
        {/* Weight Card - Span 2 */}
        <div className="col-span-2 bg-surface-50/40 backdrop-blur-[20px] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
            <Activity size={60} className="text-primary-500" />
          </div>
          <label className="block text-[10px] font-bold tracking-[0.1em] text-surface-400 uppercase mb-2">
            {t('Fields.weight_label')}
          </label>
          <div className="flex items-baseline gap-2">
            <input
              name="weight_kg"
              className="bg-transparent border-none p-0 font-bold text-5xl text-white focus:ring-0 w-full placeholder:text-surface-600 focus:outline-none"
              placeholder="00.0"
              step="0.1"
              type="number"
              required
            />
            <span className="text-primary-500 font-bold text-xl uppercase tracking-tighter">kg</span>
          </div>
        </div>

        {/* Neck Card */}
        <div className="bg-surface-50/40 backdrop-blur-[20px] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
          <label className="block text-[10px] font-bold tracking-[0.1em] text-surface-400 uppercase mb-2">
            {t('Fields.neck_label')}
          </label>
          <div className="flex items-baseline gap-2">
            <input
              name="neck_cm"
              className="bg-transparent border-none p-0 font-bold text-3xl text-white focus:ring-0 w-full placeholder:text-surface-600 focus:outline-none"
              placeholder="00"
              step="0.1"
              type="number"
              required
            />
            <span className="text-surface-400 font-bold text-xs uppercase">cm</span>
          </div>
        </div>

        {/* Waist Card */}
        <div className="bg-surface-50/40 backdrop-blur-[20px] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
          <label className="block text-[10px] font-bold tracking-[0.1em] text-surface-400 uppercase mb-2">
            {t('Fields.waist_label')}
          </label>
          <div className="flex items-baseline gap-2">
            <input
              name="waist_cm"
              className="bg-transparent border-none p-0 font-bold text-3xl text-white focus:ring-0 w-full placeholder:text-surface-600 focus:outline-none"
              placeholder="00"
              step="0.1"
              type="number"
              required
            />
            <span className="text-surface-400 font-bold text-xs uppercase">cm</span>
          </div>
        </div>
      </section>

      {/* Wellness Controls */}
      <section className="space-y-8 mb-12">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
              <Zap size={16} className="text-primary-500" /> Energy Level
            </h3>
            <span className="text-primary-500 font-extrabold text-lg">{energyLevel.toString().padStart(2, '0')}</span>
          </div>
          <input 
            type="range" min="1" max="10" 
            value={energyLevel} onChange={e => setEnergyLevel(Number(e.target.value))}
            className="w-full h-2 bg-surface-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Low</span>
            <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Peak</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm tracking-wide uppercase mb-4 flex items-center gap-2">
            <Moon size={16} className="text-primary-500" /> Sleep Quality
          </h3>
          <div className="flex gap-2">
            {(['poor', 'good', 'elite'] as const).map(quality => (
              <button
                key={quality}
                type="button"
                onClick={() => setSleepQuality(quality)}
                className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  sleepQuality === quality 
                    ? 'bg-primary-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-105' 
                    : 'bg-surface-50 border border-white/5 text-surface-400 hover:bg-surface-100'
                }`}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
              <Target size={16} className="text-primary-500" /> Stress Level
            </h3>
            <span className="text-surface-400 font-extrabold text-lg">{stressLevel.toString().padStart(2, '0')}</span>
          </div>
          <input 
            type="range" min="1" max="10" 
            value={stressLevel} onChange={e => setStressLevel(Number(e.target.value))}
            className="w-full h-2 bg-surface-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>
      </section>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-[10px] font-bold text-surface-400 uppercase tracking-widest ml-2">
          {t('Fields.notes_label')}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full p-4 bg-surface-50/40 rounded-2xl border border-white/5 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none font-medium text-sm text-white placeholder-surface-500 transition-all"
          placeholder={t('Fields.notes_placeholder')}
        />
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className="w-full py-5 mt-6 bg-gradient-primary rounded-full text-black font-extrabold uppercase tracking-[0.15em] text-sm shadow-[0_20px_40px_rgba(249,115,22,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        {isLoading ? '...' : t('submit_button')}
      </button>
    </form>
  );
}


