import React from 'react';
import { useTranslations } from 'next-intl';

export function RecommendedWorkout() {
  const t = useTranslations('Dashboard');

  return (
    <section className="bg-gradient-to-br from-primary-500/10 to-transparent p-6 rounded-xl border border-primary-500/10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-xl text-white">Upper Body Blast</h4>
          <p className="text-xs text-surface-400 mt-1">Recommended for today • 55 mins</p>
        </div>
        <div className="bg-primary-500 text-black font-bold text-xs px-2 py-1 rounded">HOT</div>
      </div>
      <button className="w-full py-3 bg-gradient-primary hover:shadow-glow-orange rounded-xl font-bold text-white uppercase tracking-wider text-sm active:scale-95 transition-all">
        Start Workout
      </button>
    </section>
  );
}
