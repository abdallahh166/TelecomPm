'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { useUsersByOffice } from '@/hooks/use-users';
import { formatLabel } from '@/lib/format';

export default function AdminUsersPage() {
  const auth = useAuth();
  const officeId = auth.user?.officeId;
  const [page, setPage] = useState(1);
  const [onlyActive, setOnlyActive] = useState(true);
  const usersQuery = useUsersByOffice(officeId, page, { onlyActive, pageSize: 10 }, Boolean(officeId));

  if (!officeId) {
    return <ErrorState message="Your account is missing office assignment." />;
  }

  if (usersQuery.isLoading) {
    return <LoadingState label="Loading users..." />;
  }

  if (usersQuery.isError || !usersQuery.data) {
    return <ErrorState message="Failed to load users." onRetry={() => usersQuery.refetch()} />;
  }

  if (usersQuery.data.data.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <Header onlyActive={onlyActive} onOnlyActiveChange={setOnlyActive} />
        <EmptyState label="No users found for this office and filter set." />
      </main>
    );
  }

  const rows = usersQuery.data.data.map((user) => [
    <Link className="text-brand-blue underline" href={`/admin/users/${user.id}`} key={`${user.id}-name`}>
      {user.name}
    </Link>,
    user.email,
    formatLabel(user.role),
    <StatusBadge key={`${user.id}-active`} status={user.isActive ? 'Active' : 'Inactive'} />,
    `${user.assignedSitesCount ?? 0}/${user.maxAssignedSites ?? '-'}`,
    user.performanceRating != null ? `${user.performanceRating.toFixed(2)}` : 'N/A',
    <div className="flex gap-2" key={`${user.id}-actions`}>
      <Link className="text-brand-blue underline" href={`/admin/users/${user.id}/edit`}>
        Edit
      </Link>
      <Link className="text-brand-blue underline" href={`/admin/users/${user.id}/performance`}>
        Performance
      </Link>
    </div>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <Header onlyActive={onlyActive} onOnlyActiveChange={setOnlyActive} />
      <DataTable
        headers={['Name', 'Email', 'Role', 'Status', 'Assigned Sites', 'Performance', 'Actions']}
        rows={rows}
      />
      <Pagination
        hasNext={usersQuery.data.pagination.hasNextPage}
        onNext={() => setPage((current) => current + 1)}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        page={page}
      />
    </main>
  );
}

function Header({
  onlyActive,
  onOnlyActiveChange,
}: {
  onlyActive: boolean;
  onOnlyActiveChange: (value: boolean) => void;
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Admin Users</h1>
        <p className="text-sm text-slate-400">User governance, activation state, and role lifecycle controls.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            checked={onlyActive}
            className="h-4 w-4"
            onChange={(event) => onOnlyActiveChange(event.target.checked)}
            type="checkbox"
          />
          Only Active
        </label>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/admin/users/new">
          New User
        </Link>
      </div>
    </section>
  );
}
