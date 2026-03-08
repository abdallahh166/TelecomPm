'use client';

import Link from 'next/link';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useRolePermissions } from '@/hooks/use-roles';

export default function RolePermissionsCatalogPage() {
  const permissionsQuery = useRolePermissions();

  if (permissionsQuery.isLoading) {
    return <LoadingState label="Loading permissions catalog..." />;
  }

  if (permissionsQuery.isError || !permissionsQuery.data) {
    return <ErrorState message="Failed to load permissions catalog." onRetry={() => permissionsQuery.refetch()} />;
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Permissions Catalog</h1>
        <p className="text-sm text-slate-400">Reference list of backend permission keys used for role assignment.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/admin/roles">
          Back to roles
        </Link>
      </section>

      <section className="grid gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2 xl:grid-cols-3">
        {permissionsQuery.data.map((permission) => (
          <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200" key={permission}>
            {permission}
          </div>
        ))}
      </section>
    </main>
  );
}
