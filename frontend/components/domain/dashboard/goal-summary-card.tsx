import React from 'react';
import { Target, Flame, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function GoalSummaryCard({ goal }: { goal: any }) {
  const t = useTranslations('Dashboard.GoalSummaryCard');
  const normalizedGoalType = String(goal.goal_type || '').toLowerCase();
  const isCutting = normalizedGoalType === 'cutting';
  const target = isCutting ? goal.target_body_fat_percentage : goal.ceiling_body_fat_percentage;
  const GoalIcon = isCutting ? Flame : Zap;

  const current = goal.current_body_fat_percentage;
  const initial = goal.initial_body_fat_percentage || current;
  const progress = initial && target && current
    ? Math.min(100, Math.max(0, ((initial - current) / (initial - target)) * 100))
    : 0;

  return (
    <div className="card overflow-hidden shadow-sm border border-surface-100">
      <div className={`px-6 py-4 flex items-center justify-between ${isCutting ? 'bg-gradient-primary' : 'bg-gradient-dark'}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <GoalIcon size={16} className="text-white" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-widest">
            {isCutting ? t('cutting_phase') : t('bulking_phase')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-soft" />
          <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{t('active')}</span>
        </div>
      </div>

      <div className="p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="10"
            />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={isCutting ? '#f97316' : '#171717'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - Math.max(0, progress) / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-surface-900 tracking-tighter">
              {current?.toFixed(1) || '?'}%
            </span>
            <span className="text-[10px] text-surface-400 font-bold uppercase tracking-widest mt-1">{t('body_fat')}</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100/50">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-primary-500" />
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{t('target')}</span>
              </div>
              <span className="text-2xl font-black text-surface-900 leading-none">{target}%</span>
            </div>
            
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{t('status')}</span>
              </div>
              <span className="text-sm font-black text-primary-600 uppercase tracking-tight">{t('active')}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{t('progress_label')}</span>
              <span className="text-xs font-black text-surface-900">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full bg-surface-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full ${isCutting ? 'bg-gradient-primary shadow-glow-orange' : 'bg-surface-900'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

