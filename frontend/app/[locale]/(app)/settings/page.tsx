'use client';

import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, LogOut, User, Moon, Sun, Monitor, Palette } from 'lucide-react';
import { useAuthStore } from '@/lib/state/auth-store';
import { logout } from '@/lib/auth/logout';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from '@/components/domain/settings/language-selector';

export default function SettingsPage() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('Settings');
  const tp = useTranslations('Settings.Preferences');
  const td = useTranslations('Settings.DangerZone');

  // Avoid hydration mismatch by only rendering theme controls after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-slide-up pb-12">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <SettingsIcon size={22} className="text-primary-500" />
          <h1 className="page-title">{t('title')}</h1>
        </div>
        <p className="page-subtitle mt-1">{t('subtitle')}</p>
      </div>

      {/* Account Profile Card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-gradient-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
              <User size={16} className="text-primary-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">{t('AccountProfile.title')}</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="font-semibold text-surface-900 text-sm">{t('AccountProfile.session_status')}</div>
              <div className="text-xs text-surface-400 mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
                {status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-gradient-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
              <Palette size={16} className="text-primary-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">{tp('title')}</h3>
          </div>
        </div>
        <div className="p-6 space-y-10">
          {/* Theme Control */}
          <div className="space-y-4">
            <div className="font-semibold text-surface-900 text-sm">{tp('appearance')}</div>
            {mounted ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'light', icon: Sun, label: tp('light') },
                  { id: 'dark', icon: Moon, label: tp('dark') },
                  { id: 'system', icon: Monitor, label: tp('system') },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id)}
                    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                      theme === item.id 
                      ? 'border-primary-500 bg-primary-50 text-primary-700' 
                      : 'border-surface-200 bg-surface-50 text-surface-600 hover:border-surface-300'
                    }`}
                  >
                    <item.icon size={22} className={theme === item.id ? 'text-primary-600' : 'text-surface-400'} />
                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-[92px] rounded-xl bg-surface-100 animate-pulse"></div>
            )}
          </div>

          <div className="border-t border-dashed border-surface-200 pt-6">
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card overflow-hidden border-red-100 shadow-md">
        <div className="px-6 py-4 bg-red-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-800/40 flex items-center justify-center">
              <LogOut size={16} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">{td('title')}</h3>
          </div>
        </div>
        <div className="p-6">
          <button 
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-700 font-bold text-sm rounded-xl hover:bg-red-100 transition-all active:scale-[0.98] border border-red-200 shadow-sm"
          >
            {td('sign_out')}
          </button>
          <p className="text-xs text-red-900/40 mt-3 leading-relaxed">
            {td('sign_out_description')}
          </p>
        </div>
      </div>
    </div>
  );
}

