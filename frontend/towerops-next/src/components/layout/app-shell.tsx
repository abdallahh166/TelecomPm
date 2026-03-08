'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { hasAnyRole, ROLE_GROUPS } from '@/lib/roles';

type NavItem = {
  href: string;
  label: string;
  allowedRoles?: readonly string[];
};

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const pathname = usePathname();
  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/analytics', label: 'Analytics', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/reports', label: 'Reports', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/sites', label: 'Sites', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/assets', label: 'Assets', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/workorders', label: 'Work Orders', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/visits', label: 'Visits', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/operations/daily-plans', label: 'Daily Plans', allowedRoles: ROLE_GROUPS.OPERATIONS },
    {
      href: '/operations/checklist-templates',
      label: 'Checklist Templates',
      allowedRoles: ROLE_GROUPS.OPERATIONS,
    },
    { href: '/escalations', label: 'Escalations', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/operations/sync-monitor', label: 'Sync Monitor', allowedRoles: ROLE_GROUPS.OPERATIONS },
    { href: '/inventory/materials', label: 'Materials', allowedRoles: ROLE_GROUPS.INVENTORY },
    { href: '/reviews/visits', label: 'Visit Reviews', allowedRoles: ROLE_GROUPS.REVIEW },
    { href: '/engineer/my-day', label: 'Engineer My Day', allowedRoles: ROLE_GROUPS.ENGINEER },
    { href: '/engineer/sync', label: 'Engineer Sync', allowedRoles: ROLE_GROUPS.ENGINEER },
    { href: '/portal/dashboard', label: 'Portal', allowedRoles: ROLE_GROUPS.PORTAL },
    { href: '/admin/users', label: 'Admin Users', allowedRoles: ROLE_GROUPS.ADMIN },
    { href: '/admin/offices', label: 'Admin Offices', allowedRoles: ROLE_GROUPS.ADMIN },
    { href: '/admin/roles', label: 'Admin Roles', allowedRoles: ROLE_GROUPS.ADMIN },
    { href: '/admin/settings', label: 'Admin Settings', allowedRoles: ROLE_GROUPS.ADMIN },
    { href: '/privacy/data-export', label: 'Data Export' },
    { href: '/change-password', label: 'Change Password' },
  ];
  const visibleNavItems = navItems.filter((item) => hasAnyRole(auth.user?.role, item.allowedRoles));

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
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  className={`block rounded-md px-3 py-2 transition ${
                    isActive
                      ? 'bg-slate-900 text-brand-blue'
                      : 'text-slate-200 hover:bg-slate-900 hover:text-brand-blue'
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
