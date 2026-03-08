'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateRole, useRolePermissions } from '@/hooks/use-roles';
import { toApiError } from '@/lib/error-adapter';

export default function NewRolePage() {
  const router = useRouter();
  const permissionsQuery = useRolePermissions();
  const createMutation = useCreateRole();
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const sortedPermissions = useMemo(() => permissionsQuery.data ?? [], [permissionsQuery.data]);

  if (permissionsQuery.isLoading) {
    return <LoadingState label="Loading permissions catalog..." />;
  }

  if (permissionsQuery.isError || !permissionsQuery.data) {
    return <ErrorState message="Failed to load permissions catalog." onRetry={() => permissionsQuery.refetch()} />;
  }

  const canSubmit = name.trim().length > 0 && displayName.trim().length > 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Role</h1>
        <p className="text-sm text-slate-400">Create a role and assign permissions from the catalog.</p>
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

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Name</span>
          <Input onChange={(event) => setName(event.target.value)} placeholder="custom.supervisor" value={name} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Display Name</span>
          <Input onChange={(event) => setDisplayName(event.target.value)} placeholder="Custom Supervisor" value={displayName} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Description</span>
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-2">
          <input
            checked={isActive}
            className="h-4 w-4"
            onChange={(event) => setIsActive(event.target.checked)}
            type="checkbox"
          />
          Role is active
        </label>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Permissions</h2>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {sortedPermissions.map((permission) => {
            const checked = selectedPermissions.includes(permission);

            return (
              <label className="flex items-center gap-2 text-sm text-slate-300" key={permission}>
                <input
                  checked={checked}
                  className="h-4 w-4"
                  onChange={(event) => {
                    setSelectedPermissions((current) =>
                      event.target.checked
                        ? [...current, permission]
                        : current.filter((value) => value !== permission),
                    );
                  }}
                  type="checkbox"
                />
                {permission}
              </label>
            );
          })}
        </div>
      </section>

      <Button
        disabled={!canSubmit || createMutation.isPending}
        onClick={async () => {
          try {
            const created = await createMutation.mutateAsync({
              name: name.trim(),
              displayName: displayName.trim(),
              description: description.trim() || undefined,
              isActive,
              permissions: selectedPermissions,
            });
            setFeedback({ tone: 'success', message: 'Role created successfully. Redirecting...' });
            router.push(`/admin/roles/${created.name}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create Role
      </Button>
    </main>
  );
}
