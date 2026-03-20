import React from 'react';
import { Activity, TrendingDown } from 'lucide-react';

interface TrendSummaryCardsProps {
  trends: any;
}

export function TrendSummaryCards({ trends }: TrendSummaryCardsProps) {
  if (!trends) return null;

  const weightChange = Number(trends.weekly_weight_change_avg) || 0;
  const isLosing = weightChange < 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="stat-card flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Activity size={18} className="text-primary-600" />
        </div>
        <div>
          <h4 className="stat-label">Pace</h4>
          <div className="stat-value capitalize">
            {trends.trend?.replace(/_/g, ' ') || 'Calculating...'}
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
          <h4 className="stat-label">Avg Weekly</h4>
          <div className={`stat-value ${isLosing ? 'text-green-600' : 'text-amber-600'}`}>
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(2)} kg
          </div>
        </div>
      </div>
    </div>
  );
}
