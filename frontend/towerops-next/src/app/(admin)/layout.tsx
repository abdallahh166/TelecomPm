import { AppShell } from '@/components/layout/app-shell';
import { RequireAuth } from '@/components/layout/require-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
