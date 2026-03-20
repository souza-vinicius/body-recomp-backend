import Link from 'next/link';
import { AppNav } from './app-nav';
import { Settings } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <header className="hidden md:block bg-gradient-dark text-white">
        <div className="container px-6 py-4 mx-auto flex justify-between items-center max-w-5xl">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-orange">
              <span className="text-white font-black text-sm">BR</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white">
              Body Recomp
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <AppNav />
            <div className="w-px h-6 bg-white/20" />
            <Link
              href="/settings"
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto md:max-w-4xl px-4 py-6 md:px-6 md:py-8 pb-28 md:pb-8 animate-fade-in">
        {children}
      </main>

      <div className="md:hidden">
        <AppNav />
      </div>
    </div>
  );
}
