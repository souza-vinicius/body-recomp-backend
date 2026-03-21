import React from 'react';
import { Timer, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function KpiCards({ trends }: { trends: any }) {
  const t = useTranslations('Dashboard.KpiCards');

  if (!trends) return null;

  const formatTrend = (trendValue: string) => {
    if (!trendValue) return '--';
    const key = `trend_${trendValue.toLowerCase().replace(/\s+/g, '_')}`;
    try {
      return t(key);
    } catch {
      return trendValue;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="stat-card flex items-start gap-3 p-4 bg-surface-white border border-surface-100 shadow-sm rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Timer size={20} className="text-primary-600" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block mb-1">{t('est_weeks')}</span>
          <span className="text-xl font-black text-surface-900 block leading-none">
            {trends.estimated_weeks_remaining ?? '--'}
            <span className="text-xs font-medium text-surface-400 ml-1.5 lowercase">{t('weeks_unit')}</span>
          </span>
        </div>
      </div>
      <div className="stat-card flex items-start gap-3 p-4 bg-surface-white border border-surface-100 shadow-sm rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center flex-shrink-0">
          <Activity size={20} className="text-white" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block mb-1">{t('pace')}</span>
          <span className="text-xl font-black text-surface-900 block leading-none truncate max-w-[120px]">
            {formatTrend(trends.trend)}
          </span>
        </div>
      </div>
    </div>
  );
}

