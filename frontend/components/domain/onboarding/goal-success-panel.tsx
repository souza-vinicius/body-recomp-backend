'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { SubmitButton } from '../../forms/submit-button';

export function GoalSuccessPanel() {
  const router = useRouter();

  return (
    <div className="text-center space-y-6 py-6 animate-scale-in">
      <div className="mx-auto w-20 h-20 bg-green-100 flex items-center justify-center rounded-2xl">
        <CheckCircle2 size={36} className="text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-black text-surface-900">You're all set!</h3>
        <p className="text-surface-400 text-sm mt-2">Your initial analysis and goals have been saved successfully.</p>
      </div>

      <SubmitButton onClick={() => router.push('/dashboard')} className="w-full gap-2 mt-4">
        Go to Dashboard
        <ArrowRight size={16} />
      </SubmitButton>
    </div>
  );
}
