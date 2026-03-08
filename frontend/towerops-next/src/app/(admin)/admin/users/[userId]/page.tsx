'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useActivateUser,
  useChangeUserRole,
  useDeactivateUser,
  useDeleteUser,
  useUnlockUserAccount,
  useUser,
} from '@/hooks/use-users';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatLabel } from '@/lib/format';

const ROLE_OPTIONS = [
  'Admin',
  'OperationsManager',
  'PMEngineer',
  'FieldEngineer',
  'Reviewer',
  'InventoryManager',
  'Viewer',
];

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params.userId;
  const userQuery = useUser(userId);
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const unlockMutation = useUnlockUserAccount();
  const changeRoleMutation = useChangeUserRole();
  const deleteMutation = useDeleteUser();
  const [newRole, setNewRole] = useState('FieldEngineer');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (userQuery.isLoading) {
    return <LoadingState label="Loading user profile..." />;
  }

  if (userQuery.isError || !userQuery.data) {
    return <ErrorState message="Failed to load user profile." onRetry={() => userQuery.refetch()} />;
  }

  const user = userQuery.data;
  const isBusy =
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    unlockMutation.isPending ||
    changeRoleMutation.isPending ||
    deleteMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed successfully.` });
      await userQuery.refetch();
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-slate-400">Administrative profile with account and role controls.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} />
          <StatusBadge status={user.role} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/admin/users">
          Back to users
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

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard label="Email" value={user.email} />
        <InfoCard label="Phone" value={user.phoneNumber} />
        <InfoCard label="Office" value={user.officeName} />
        <InfoCard label="Role" value={formatLabel(user.role)} />
        <InfoCard label="Assigned Sites" value={`${user.assignedSitesCount ?? 0}/${user.maxAssignedSites ?? '-'}`} />
        <InfoCard
          label="Performance Rating"
          value={user.performanceRating != null ? `${user.performanceRating.toFixed(2)}` : 'N/A'}
        />
        <InfoCard label="Created At" value={formatDateTime(user.createdAt)} />
        <InfoCard label="Last Login" value={formatDateTime(user.lastLoginAt)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Account Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={isBusy || user.isActive}
              onClick={() => runAction('Activate user', () => activateMutation.mutateAsync(user.id))}
              type="button"
            >
              Activate
            </Button>
            <Button
              disabled={isBusy || !user.isActive}
              onClick={() => runAction('Deactivate user', () => deactivateMutation.mutateAsync(user.id))}
              type="button"
              variant="secondary"
            >
              Deactivate
            </Button>
            <Button
              disabled={isBusy}
              onClick={() => runAction('Unlock account', () => unlockMutation.mutateAsync(user.id))}
              type="button"
              variant="secondary"
            >
              Unlock Account
            </Button>
            <Button
              disabled={isBusy}
              onClick={async () => {
                try {
                  await deleteMutation.mutateAsync(user.id);
                  router.push('/admin/users');
                } catch (error) {
                  setFeedback({ tone: 'error', message: toApiError(error).message });
                }
              }}
              type="button"
              variant="danger"
            >
              Delete User
            </Button>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Role Change</h2>
          <label className="space-y-2 text-sm text-slate-300">
            <span>New Role</span>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              onChange={(event) => setNewRole(event.target.value)}
              value={newRole}
            >
              {ROLE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <Input disabled value={`Current: ${user.role}`} />
          <Button
            disabled={isBusy || newRole === user.role}
            onClick={() =>
              runAction('Change role', () =>
                changeRoleMutation.mutateAsync({
                  userId: user.id,
                  payload: { newRole },
                }),
              )
            }
            type="button"
          >
            Apply Role
          </Button>
          <div className="text-sm">
            <Link className="text-brand-blue underline" href={`/admin/users/${user.id}/edit`}>
              Open edit profile
            </Link>
            {' | '}
            <Link className="text-brand-blue underline" href={`/admin/users/${user.id}/performance`}>
              Open performance
            </Link>
          </div>
        </div>
      </section>

      {user.specializations.length > 0 ? (
        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Specializations</h2>
          <p className="mt-3 text-sm text-slate-300">{user.specializations.join(', ')}</p>
        </section>
      ) : null}
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
