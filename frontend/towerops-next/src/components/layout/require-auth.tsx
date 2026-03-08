'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function RequireAuth({ children }: { children: ReactNode }) {
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

  return <>{children}</>;
}
