'use client';

import { useState } from 'react';
import { MeasurementStep } from '@/components/domain/onboarding/measurement-step';
import { GoalStep } from '@/components/domain/onboarding/goal-step';
import { GoalSuccessPanel } from '@/components/domain/onboarding/goal-success-panel';

export default function SetupPage() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((s) => s + 1);

  const steps = [
    { num: 1, label: 'Measure' },
    { num: 2, label: 'Goal' },
    { num: 3, label: 'Done' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center page-header">
        <h2 className="page-title">Application Setup</h2>
        <p className="page-subtitle mt-1">Let's get your initial baseline</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step >= s.num
                ? 'bg-gradient-primary text-white shadow-glow-orange'
                : 'bg-surface-100 text-surface-400'
            }`}>
              {s.num}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${
              step >= s.num ? 'text-primary-600' : 'text-surface-300'
            }`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 rounded ${step > s.num ? 'bg-primary-500' : 'bg-surface-200'} transition-colors`} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 md:p-8 animate-fade-in">
        {step === 1 && <MeasurementStep onNext={nextStep} />}
        {step === 2 && <GoalStep onNext={nextStep} />}
        {step === 3 && <GoalSuccessPanel />}
      </div>
    </div>
  );
}
