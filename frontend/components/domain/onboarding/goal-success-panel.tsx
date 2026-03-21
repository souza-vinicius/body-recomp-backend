'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SubmitButton } from '../../forms/submit-button';

export function GoalSuccessPanel() {
  const router = useRouter();
  const t = useTranslations('Onboarding.Steps.Done');

  return (
    <div className="text-center space-y-6 py-6 animate-scale-in">
      <div className="mx-auto w-20 h-20 bg-green-100 flex items-center justify-center rounded-2xl">
        <CheckCircle2 size={36} className="text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-black text-surface-900">{t('title')}</h3>
        <p className="text-surface-400 text-sm mt-2">{t('description')}</p>
      </div>

      <SubmitButton onClick={() => router.push('/dashboard')} className="w-full gap-2 mt-4">
        {t('submit_button')}
        <ArrowRight size={16} />
      </SubmitButton>
    </div>
  );
}

