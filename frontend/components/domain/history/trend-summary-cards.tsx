import React from 'react';
import { Activity, TrendingDown } from 'lucide-react';
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
  const isLosing = weightChange < 0;

  const formatTrend = (trend: string) => {
    if (!trend) return t('calculating');
    // Map backend trends to translation keys
    const key = trend.toLowerCase();
    if (key === 'improving') return tk('trend_improving');
    if (key === 'stable') return tk('trend_stable');
    if (key === 'worsening') return tk('trend_worsening');
    if (key === 'fast') return tk('trend_fast');
    return trend.replace(/_/g, ' ');
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="stat-card flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Activity size={18} className="text-primary-600" />
        </div>
        <div>
          <h4 className="stat-label">{t('pace')}</h4>
          <div className="stat-value capitalize">
            {formatTrend(trends.trend)}
          </div>
        </div>
      </div>
      <div className="stat-card flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isLosing ? 'bg-green-50' : 'bg-amber-50'
        }`}>
          <TrendingDown size={18} className={isLosing ? 'text-green-600' : 'text-amber-600'} />
        </div>
        <div>
          <h4 className="stat-label">{t('avg_weekly')}</h4>
          <div className={`stat-value ${isLosing ? 'text-green-600' : 'text-amber-600'}`}>
            {weightChange > 0 ? '+' : ''}{format.number(weightChange, { maximumFractionDigits: 2 })} kg
          </div>
        </div>
      </div>
    </div>
  );
}


