import React from 'react';
import Link from 'next/link';
import { Plus, BarChart3, ClipboardList } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { label: 'Log Progress', href: '/progress/new', icon: Plus, primary: true },
    { label: 'View History', href: '/history', icon: BarChart3, primary: false },
    { label: 'My Plans', href: '/plans', icon: ClipboardList, primary: false },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                action.primary
                  ? 'bg-gradient-primary text-white shadow-card hover:shadow-glow-orange'
                  : 'card hover:shadow-card-hover'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                action.primary
                  ? 'bg-white/20'
                  : 'bg-surface-50'
              }`}>
                <Icon size={20} className={action.primary ? 'text-white' : 'text-surface-600'} />
              </div>
              <span className={`font-semibold text-sm ${
                action.primary ? 'text-white' : 'text-surface-700'
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
