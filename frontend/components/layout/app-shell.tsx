import Link from 'next/link';
import { AppNav } from './app-nav';
import { Settings } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <header className="hidden md:block bg-gradient-dark text-white border-b border-white/5">
        <div className="container px-6 py-4 mx-auto flex justify-between items-center max-w-5xl">
          <Link href="/dashboard" className="flex items-center gap-3 group transition-transform active:scale-[0.98]">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300">
              <span className="text-white font-black text-sm">BR</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white group-hover:translate-x-0.5 transition-transform duration-300">
              Body Recomp
            </h1>
          </Link>
          <div className="flex items-center gap-6">
            <AppNav />
            <div className="w-px h-6 bg-white/10" />
            <Link
              href="/settings"
              className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 hover:rotate-12 active:scale-90"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto md:max-w-4xl px-4 py-6 md:px-6 md:py-8 pb-32 md:pb-12 animate-fade-in">
        {children}
      </main>

      <div className="md:hidden">
        <AppNav />
      </div>
    </div>
  );
}

