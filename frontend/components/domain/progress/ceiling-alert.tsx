import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface CeilingAlertProps {
  currentBodyFat: number;
}

export function CeilingAlert({ currentBodyFat }: CeilingAlertProps) {
  const isApproachingCeiling = currentBodyFat >= 14 && currentBodyFat < 15;
  const isOverCeiling = currentBodyFat >= 15;

  if (!isApproachingCeiling && !isOverCeiling) return null;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
      isOverCeiling
        ? 'bg-red-950/40 border-red-500/30 text-red-100'
        : 'bg-amber-950/40 border-amber-500/30 text-amber-100'
    }`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isOverCeiling ? 'bg-red-900/40' : 'bg-amber-900/40'
      }`}>
        <AlertTriangle size={18} className={isOverCeiling ? 'text-red-400' : 'text-amber-400'} />
      </div>
      <div>
        <h4 className="font-bold text-sm">
          {isOverCeiling ? 'Bulking Ceiling Reached' : 'Approaching Bulking Ceiling'}
        </h4>
        <p className="text-sm mt-1 opacity-80">
          Your body fat percentage is estimated at {currentBodyFat}%. 
          {isOverCeiling 
            ? " It's generally recommended to transition to a deficit (cutting) phase to reset insulin sensitivity." 
            : " You are getting close to the recommended ceiling for optimal muscle growth."}
        </p>
        {isOverCeiling && (
          <div className="mt-3">
            <Link href="/plans" className="text-sm font-bold underline hover:opacity-80 transition-opacity">
              Review Goal & Plan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
