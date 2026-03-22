import React from 'react';
import { Link } from '@/lib/navigation';
import { Edit, BarChart3, ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function QuickActions() {
  const t = useTranslations('Dashboard.QuickActions');

  const actions = [
    { label: t('log_progress'), href: '/progress/new', icon: Edit, primary: true },
    { label: t('view_history'), href: '/history', icon: BarChart3, primary: false },
    { label: t('my_plans'), href: '/plans', icon: ClipboardList, primary: false },
  ];

  return (
    <section>
      <h3 className="text-[0.6875rem] uppercase tracking-[0.1em] text-surface-400 mb-6 ml-1">
        {t('title')}
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex-none w-32 h-32 bg-surface-50/40 backdrop-blur-md rounded-xl border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors group"
            >
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                  action.primary ? 'bg-primary-500/10 text-primary-500' : 'bg-surface-800 text-surface-400'
                }`}
              >
                <Icon size={24} />
              </div>
              <span className="text-[10px] uppercase font-semibold text-white">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

