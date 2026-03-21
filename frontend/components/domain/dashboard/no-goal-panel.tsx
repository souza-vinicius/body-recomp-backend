import React from 'react';
import { Link } from '@/lib/navigation';
import { Target, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function NoGoalPanel() {
  const t = useTranslations('Dashboard.NoGoalPanel');

  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center gap-5 animate-slide-up border-dashed border-2 border-surface-200 bg-surface-50/50">
      <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center shadow-inner">
        <Target size={32} className="text-primary-500" />
      </div>
      <div className="max-w-xs">
        <h3 className="text-xl font-black text-surface-900 tracking-tight">{t('title')}</h3>
        <p className="text-surface-500 text-sm mt-2 leading-relaxed">
          {t('description')}
        </p>
      </div>
      <Link
        href="/setup"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-primary text-white rounded-2xl font-bold text-sm mt-2 hover:shadow-glow-orange transition-all duration-300 active:scale-[0.98] shadow-md border border-primary-400/20"
      >
        {t('button')}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

