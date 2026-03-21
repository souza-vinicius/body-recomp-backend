import React from 'react';
import { Link } from '@/lib/navigation';
import { Plus, BarChart3, ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function QuickActions() {
  const t = useTranslations('Dashboard.QuickActions');

  const actions = [
    { label: t('log_progress'), href: '/progress/new', icon: Plus, primary: true },
    { label: t('view_history'), href: '/history', icon: BarChart3, primary: false },
    { label: t('my_plans'), href: '/plans', icon: ClipboardList, primary: false },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em] mb-3">{t('title')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] ${
                action.primary
                  ? 'bg-gradient-primary text-white shadow-md hover:shadow-glow-orange border border-primary-400/20'
                  : 'bg-surface-white border border-surface-100 shadow-sm hover:shadow-md hover:border-surface-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                action.primary
                  ? 'bg-white/20'
                  : 'bg-surface-50'
              }`}>
                <Icon size={22} className={action.primary ? 'text-white' : 'text-primary-600'} />
              </div>
              <span className={`font-bold text-sm tracking-tight ${
                action.primary ? 'text-white' : 'text-surface-800'
              }`}>
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

