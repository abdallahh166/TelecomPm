'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { hasAnyRole } from '@/lib/roles';

export function RequireAuth({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: readonly string[];
}) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace('/login');
    }
  }, [auth.isAuthenticated, router]);

  if (!auth.isAuthenticated) {
    return <div className="p-6">Redirecting to login...</div>;
  }

  if (!hasAnyRole(auth.user?.role, allowedRoles)) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-slate-300">Your role does not have permission to access this workspace.</p>
      </div>
    );
  }

  return <>{children}</>;
}
