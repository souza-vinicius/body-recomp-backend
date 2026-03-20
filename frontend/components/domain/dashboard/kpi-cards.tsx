import React from 'react';
import { Timer, Activity } from 'lucide-react';

export function KpiCards({ trends }: { trends: any }) {
  if (!trends) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="stat-card flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Timer size={18} className="text-primary-600" />
        </div>
        <div>
          <span className="stat-label">Est. Weeks</span>
          <span className="stat-value block">{trends.estimated_weeks_remaining ?? '--'}</span>
        </div>
      </div>
      <div className="stat-card flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-900 flex items-center justify-center flex-shrink-0">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <span className="stat-label">Pace</span>
          <span className="stat-value block capitalize">{trends.trend?.replace(/_/g, ' ') ?? '--'}</span>
        </div>
      </div>
    </div>
  );
}
