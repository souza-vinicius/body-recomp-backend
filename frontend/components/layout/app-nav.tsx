"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, TrendingUp, Clock, ClipboardList, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/plans', label: 'Plans', icon: ClipboardList },
];

export function AppNav() {
  const pathname = usePathname() ?? '';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-surface-100 pb-safe md:relative md:border-t-0 md:bg-transparent md:backdrop-blur-none">
      <div className="max-w-md mx-auto md:max-w-none">
        <ul className="flex justify-between px-2 py-1.5 md:justify-start md:gap-1 md:px-0 md:py-0">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1 md:flex-none">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full py-2 gap-0.5 text-[11px] md:text-sm font-medium transition-all duration-200 md:flex-row md:gap-2 md:px-3 md:py-2 md:rounded-lg ${
                    isActive
                      ? 'text-primary-600 md:bg-primary-50'
                      : 'text-surface-400 hover:text-surface-700 md:hover:bg-surface-50'
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="transition-all duration-200"
                  />
                  <span>{item.label}</span>
                  {isActive && <div className="nav-active-dot md:hidden" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
