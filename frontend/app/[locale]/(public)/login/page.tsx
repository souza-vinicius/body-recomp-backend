'use client';

import { LoginForm } from '@/components/domain/auth/login-form';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Auth.Login');

  return (
    <div className="w-full animate-slide-up">
      <div className="bg-white/95 backdrop-blur-sm px-6 py-8 shadow-elevated rounded-2xl">
        <h2 className="text-xl font-black mb-1 text-center text-surface-900">{t('title')}</h2>
        <p className="text-sm text-surface-400 text-center mb-6">{t('subtitle')}</p>
        <LoginForm />
        <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-surface-400">
          {t('no_account')}{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 transition-colors ml-1">
            {t('register_link')}
          </Link>
        </div>
      </div>
    </div>
  );
}

