import React from 'react';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';

interface TrendSummaryCardsProps {
  trends: any;
}

export function TrendSummaryCards({ trends }: TrendSummaryCardsProps) {
  const t = useTranslations('History.TrendCards');
  const tk = useTranslations('Dashboard.KpiCards');
  const format = useFormatter();
  
  if (!trends) return null;

  const weightChange = Number(trends.weekly_weight_change_avg) || 0;
  const isLosing = weightChange <= 0;

  const formatTrend = (trend: string) => {
    if (!trend) return t('calculating');
    const key = trend.toLowerCase();
    if (key === 'improving') return tk('trend_improving');
    if (key === 'stable') return tk('trend_stable');
    if (key === 'worsening') return tk('trend_worsening');
    if (key === 'fast') return tk('trend_fast');
    return trend.replace(/_/g, ' ');
  };

  return (
    <section className="grid grid-cols-2 gap-4 mb-12">
      <div className="bg-surface-900/40 backdrop-blur-[20px] p-6 rounded-3xl border border-white/5 flex flex-col justify-between aspect-square">
        <div>
          <Activity className="text-primary-500 leading-none mb-4 block" size={24} />
          <h3 className="text-[10px] uppercase tracking-widest text-surface-400 font-bold leading-tight">
            {t('pace')}
          </h3>
        </div>
        <div className="flex items-end gap-1 text-white">
          <span className="text-3xl font-bold leading-none capitalize line-clamp-1">{formatTrend(trends.trend)}</span>
        </div>
      </div>
      
      <div className="bg-surface-900/40 backdrop-blur-[20px] p-6 rounded-3xl border border-white/5 flex flex-col justify-between aspect-square">
        <div>
          {isLosing ? (
             <TrendingDown className="text-primary-500 leading-none mb-4 block" size={24} />
          ) : (
             <TrendingUp className="text-primary-500 leading-none mb-4 block" size={24} />
          )}
          <h3 className="text-[10px] uppercase tracking-widest text-surface-400 font-bold leading-tight">
            {t('avg_weekly')}
          </h3>
        </div>
        <div className="flex items-end gap-1 text-white">
          <span className="text-3xl font-bold leading-none">{weightChange > 0 ? '+' : ''}{format.number(weightChange, { maximumFractionDigits: 2 })}</span>
          <span className="text-primary-500 text-lg font-bold mb-1 leading-none ml-1">kg</span>
        </div>
      </div>
    </section>
  );
}


