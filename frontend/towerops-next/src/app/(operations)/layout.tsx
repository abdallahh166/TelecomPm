import { AppShell } from '@/components/layout/app-shell';
import { RequireAuth } from '@/components/layout/require-auth';
import { ROLE_GROUPS } from '@/lib/roles';

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={ROLE_GROUPS.OPERATIONS}>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
