'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">TowerOps</h1>
          <p className="text-xs text-slate-400">Operations Platform</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-300">{auth.user?.email ?? 'Guest'}</span>
          <button className="text-brand-blue" onClick={() => auth.logout()} type="button">
            Logout
          </button>
        </div>
      </header>
      <div className="grid grid-cols-[220px_1fr]">
        <aside className="min-h-[calc(100vh-73px)] border-r border-slate-800 p-4">
          <nav className="space-y-3 text-sm">
            <Link className="block text-slate-200 hover:text-brand-blue" href="/workorders">
              Work Orders
            </Link>
            <Link className="block text-slate-200 hover:text-brand-blue" href="/sites">
              Sites
            </Link>
            <Link className="block text-slate-200 hover:text-brand-blue" href="/login">
              Login
            </Link>
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
