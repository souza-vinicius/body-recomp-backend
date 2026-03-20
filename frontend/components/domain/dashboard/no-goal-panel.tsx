import React from 'react';
import Link from 'next/link';
import { Target } from 'lucide-react';

export function NoGoalPanel() {
  return (
    <div className="card p-8 flex flex-col items-center justify-center text-center gap-4 animate-slide-up">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
        <Target size={28} className="text-primary-500" />
      </div>
      <div>
        <h3 className="text-lg font-black text-surface-900">No Active Goal</h3>
        <p className="text-surface-400 text-sm mt-1 max-w-sm">
          You don't have an active body recomposition goal. Set one up to start tracking your progress.
        </p>
      </div>
      <Link
        href="/setup"
        className="inline-flex px-6 py-2.5 bg-gradient-primary text-white rounded-xl font-semibold text-sm mt-2 hover:shadow-glow-orange transition-all duration-200 active:scale-[0.98]"
      >
        Set Up Goal
      </Link>
    </div>
  );
}
