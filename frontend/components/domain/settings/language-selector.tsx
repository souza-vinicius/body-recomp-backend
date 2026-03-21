'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Settings.Preferences');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
    { code: 'pt-PT', name: 'Português (PT)', flag: '🇵🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe size={16} className="text-surface-400" />
        <span className="font-semibold text-surface-900 text-sm">{t('language')}</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
              locale === lang.code
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-surface-200 bg-surface-50 text-surface-600 hover:border-surface-300'
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
