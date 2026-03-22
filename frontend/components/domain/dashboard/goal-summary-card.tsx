import React from 'react';
import { useTranslations } from 'next-intl';

export function GoalSummaryCard({ goal }: { goal: any }) {
  const t = useTranslations('Dashboard.GoalSummaryCard');
  const normalizedGoalType = String(goal.goal_type || '').toLowerCase();
  const isCutting = normalizedGoalType === 'cutting';

  const current = goal.current_body_fat_percentage;
  const initial = goal.initial_body_fat_percentage || current;
  const target = isCutting ? goal.target_body_fat_percentage : goal.ceiling_body_fat_percentage;
  
  const progress = initial && target && current
    ? Math.min(100, Math.max(0, ((initial - current) / (initial - target)) * 100))
    : 0;

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference * (1 - Math.max(0, progress) / 100);

  return (
    <section className="relative flex flex-col items-center justify-center">
      {/* Kinetic Sculpture: Blurred Glow Background */}
      <div className="absolute w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -z-10" />

      {/* Circular Progress Ring Container */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle 
            className="text-surface-800" 
            cx="50" cy="50" fill="transparent" r="45" 
            stroke="currentColor" strokeWidth="2" 
          />
          {/* Active Progress */}
          <circle 
            className={`transition-all duration-1000 ease-out ${isCutting ? 'text-primary-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'text-white'}`}
            cx="50" cy="50" fill="transparent" r="45" 
            stroke="currentColor" 
            strokeDasharray={circumference} 
            strokeDashoffset={dashOffset} 
            strokeLinecap="round" strokeWidth="5" 
          />
        </svg>

        {/* Center Metrics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[0.6875rem] uppercase tracking-[0.05em] text-surface-400 mb-1">
            {t('body_fat')}
          </span>
          <span className="font-extrabold text-[3.5rem] leading-none text-white">
            {current?.toFixed(1) || '?'}<span className="text-primary-500 text-2xl">%</span>
          </span>
          
          <div className="mt-4 px-4 py-1.5 bg-surface-900/40 backdrop-blur-md rounded-full border border-white/5">
            <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-primary-500">
              {isCutting ? t('cutting_phase') : t('bulking_phase')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

