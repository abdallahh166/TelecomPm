import { AppShell } from '@/components/layout/app-shell';
import { RequireAuth } from '@/components/layout/require-auth';
import { ROLE_GROUPS } from '@/lib/roles';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN}>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
