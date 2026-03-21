import React from 'react';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function InsufficientDataPanel() {
  const t = useTranslations('History.InsufficientData');
  
  return (
    <div className="card p-6 flex items-start gap-4 border-l-4 border-l-primary-500 animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
        <Info size={20} className="text-primary-600" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-surface-900">{t('title')}</h3>
        <p className="text-sm text-surface-500 mt-1">
          {t('description')}
        </p>
      </div>
    </div>
  );
}

