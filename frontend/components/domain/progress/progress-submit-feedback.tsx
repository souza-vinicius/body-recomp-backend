import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Scale, Percent } from 'lucide-react';

interface ProgressSubmitFeedbackProps {
  summary: {
    weekly_weight_diff?: number;
    fat_mass_diff?: number;
    is_on_track?: boolean;
    warnings?: string[];
    entry?: {
      weight_kg?: number;
      body_fat_percentage?: number;
      week_number?: number;
    };
  };
  onClose: () => void;
}

export function ProgressSubmitFeedback({ summary, onClose }: ProgressSubmitFeedbackProps) {
  const entry = summary.entry;

  return (
    <div className="card p-8 text-center max-w-md mx-auto space-y-6 shadow-elevated">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-green-100 flex items-center justify-center">
        <CheckCircle2 size={36} className="text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-black text-surface-900">Progress Logged!</h2>
        {entry?.week_number && (
          <p className="text-surface-500 text-sm mt-2">
            Week <span className="font-semibold text-primary-600">#{entry.week_number}</span> recorded successfully.
          </p>
        )}
      </div>

      {entry && (
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-surface-100">
          <div className="text-left">
            <span className="stat-label flex items-center gap-1">
              <Scale size={12} /> Weight
            </span>
            <span className="text-xl font-black text-surface-900 block mt-1">
              {entry.weight_kg?.toFixed(1)} kg
            </span>
          </div>
          <div className="text-left">
            <span className="stat-label flex items-center gap-1">
              <Percent size={12} /> Body Fat
            </span>
            <span className="text-xl font-black text-primary-600 block mt-1">
              {entry.body_fat_percentage?.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {summary.warnings && summary.warnings.length > 0 && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm text-left border border-amber-100">
          <ul className="list-disc pl-5 space-y-1">
            {summary.warnings.map((w: string, i: number) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-glow-orange transition-all duration-200 active:scale-[0.98]"
        >
          Return to Dashboard
          <ArrowRight size={16} />
        </Link>
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-primary-600 font-semibold text-sm hover:bg-primary-50 rounded-xl transition-colors"
        >
          View History
        </button>
      </div>
    </div>
  );
}
