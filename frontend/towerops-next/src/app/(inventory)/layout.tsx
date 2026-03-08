import { AppShell } from '@/components/layout/app-shell';
import { RequireAuth } from '@/components/layout/require-auth';
import { ROLE_GROUPS } from '@/lib/roles';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={ROLE_GROUPS.INVENTORY}>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
