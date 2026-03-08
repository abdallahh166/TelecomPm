'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDeleteRole, useRole } from '@/hooks/use-roles';
import { toApiError } from '@/lib/error-adapter';

export default function RoleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roleId = params.id;
  const roleQuery = useRole(roleId);
  const deleteMutation = useDeleteRole();
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (roleQuery.isLoading) {
    return <LoadingState label="Loading role..." />;
  }

  if (roleQuery.isError || !roleQuery.data) {
    return <ErrorState message="Failed to load role." onRetry={() => roleQuery.refetch()} />;
  }

  const role = roleQuery.data;

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{role.displayName}</h1>
          <p className="text-sm text-slate-400">Role definition and permission scope.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={role.isActive ? 'Active' : 'Inactive'} />
          <StatusBadge status={role.isSystem ? 'System' : 'Custom'} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/admin/roles">
          Back to roles
        </Link>
      </section>

      {feedback ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Role Name" value={role.name} />
        <InfoCard label="Display Name" value={role.displayName} />
        <InfoCard label="Description" value={role.description ?? 'No description'} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Permissions ({role.permissions.length})</h2>
        {role.permissions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No permissions assigned.</p>
        ) : (
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {role.permissions.map((permission) => (
              <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200" key={permission}>
                {permission}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href={`/admin/roles/${role.name}/edit`}>
          Edit Role
        </Link>
        <Button
          disabled={deleteMutation.isPending || role.isSystem}
          onClick={async () => {
            try {
              await deleteMutation.mutateAsync(role.name);
              router.push('/admin/roles');
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
          variant="danger"
        >
          Delete Role
        </Button>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm text-slate-100">{value}</p>
    </div>
  );
}
