import React from 'react';
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
      <div className="bg-surface-50 p-6 rounded-xl flex flex-col justify-between h-40 border border-white/5">
        <span className="text-[0.6875rem] uppercase tracking-[0.05em] text-surface-400 leading-tight">
          {t('est_weeks')}
        </span>
        <div className="text-right">
          <span className="font-bold text-5xl text-white">
            {trends.estimated_weeks_remaining ?? '--'}
          </span>
        </div>
      </div>
      <div className="bg-surface-50 p-6 rounded-xl flex flex-col justify-between h-40 border border-white/5">
        <span className="text-[0.6875rem] uppercase tracking-[0.05em] text-surface-400 leading-tight">
          {t('pace')}
        </span>
        <div className="text-right">
          <span className="font-bold text-2xl text-primary-500 leading-tight line-clamp-2">
            {formatTrend(trends.trend)}
          </span>
        </div>
      </div>
    </div>
  );
}

