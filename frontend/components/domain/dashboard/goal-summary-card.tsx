import React from 'react';
import { Target, Flame, Zap } from 'lucide-react';

export function GoalSummaryCard({ goal }: { goal: any }) {
  const normalizedGoalType = String(goal.goal_type || '').toLowerCase();
  const isCutting = normalizedGoalType === 'cutting';
  const target = isCutting ? goal.target_body_fat_percentage : goal.ceiling_body_fat_percentage;
  const goalLabel = isCutting ? 'Cutting' : 'Bulking';
  const GoalIcon = isCutting ? Flame : Zap;

  const current = goal.current_body_fat_percentage;
  const initial = goal.initial_body_fat_percentage || current;
  const progress = initial && target && current
    ? Math.min(100, Math.max(0, ((initial - current) / (initial - target)) * 100))
    : 0;

  return (
    <div className="card overflow-hidden">
      <div className={`px-6 py-3 flex items-center gap-2 ${isCutting ? 'bg-gradient-primary' : 'bg-gradient-dark'}`}>
        <GoalIcon size={16} className="text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          {goalLabel} Phase
        </span>
      </div>

      <div className="p-6 flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="#f5f5f5"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={isCutting ? '#f97316' : '#171717'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - Math.max(0, progress) / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-surface-900">
              {current?.toFixed(1) || '?'}%
            </span>
            <span className="text-xs text-surface-400 font-medium">Body Fat</span>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-surface-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Target size={14} className="text-surface-400" />
              <span className="text-xs text-surface-400 font-medium">Target</span>
            </div>
            <span className="text-lg font-bold text-surface-900">{target}%</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-surface-400 font-medium block mb-1">Status</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
