'use client';

import React from 'react';
import { Settings as SettingsIcon, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/lib/state/auth-store';
import { logout } from '@/lib/auth/logout';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-slide-up">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <SettingsIcon size={22} className="text-primary-500" />
          <h1 className="page-title">Settings</h1>
        </div>
        <p className="page-subtitle mt-1">Manage your account and app preferences.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-3 bg-gradient-dark flex items-center gap-2">
          <User size={16} className="text-primary-400" />
          <h3 className="text-sm font-bold text-white">Account Profile</h3>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="font-semibold text-surface-900 text-sm">Session Status</div>
              <div className="text-xs text-surface-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
                {status}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden border-red-100">
        <div className="px-6 py-3 bg-red-600 flex items-center gap-2">
          <LogOut size={16} className="text-red-200" />
          <h3 className="text-sm font-bold text-white">Danger Zone</h3>
        </div>
        <div className="p-6">
          <button 
            onClick={handleLogout}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-700 font-semibold text-sm rounded-xl hover:bg-red-100 transition-all active:scale-[0.98] border border-red-200"
          >
            Sign Out
          </button>
          <p className="text-xs text-surface-400 mt-3">
            This will clear your session on this device.
          </p>
        </div>
      </div>
    </div>
  );
}
