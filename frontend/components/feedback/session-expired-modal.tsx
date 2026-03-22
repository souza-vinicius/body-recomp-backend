'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { logout } from '@/lib/auth/logout';
import { useRouter } from 'next/navigation';

interface SessionExpiredModalProps {
  isOpen: boolean;
}

export function SessionExpiredModal({ isOpen }: SessionExpiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRelogin = () => {
    logout();
    router.push('/login?expired=true');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-elevated animate-scale-in">
        <div className="w-16 h-16 bg-red-900/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black text-surface-900">Session Expired</h2>
          <p className="text-surface-500 text-sm mt-2">
            Your session has expired for security reasons. Please log in again to continue.
          </p>
        </div>
        <button
          onClick={handleRelogin}
          className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-xl hover:shadow-glow-orange transition-all duration-200 active:scale-[0.98]"
        >
          Sign In Again
        </button>
      </div>
    </div>
  );
}
