'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useRoles } from '@/hooks/use-roles';

export default function AdminRolesPage() {
  const [page, setPage] = useState(1);
  const rolesQuery = useRoles(page, { pageSize: 10 }, true);

  if (rolesQuery.isLoading) {
    return <LoadingState label="Loading roles..." />;
  }

  if (rolesQuery.isError || !rolesQuery.data) {
    return <ErrorState message="Failed to load roles." onRetry={() => rolesQuery.refetch()} />;
  }

  if (rolesQuery.data.data.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <Header />
        <EmptyState label="No roles found." />
      </main>
    );
  }

  const rows = rolesQuery.data.data.map((role) => [
    <Link className="text-brand-blue underline" href={`/admin/roles/${role.name}`} key={`${role.name}-name`}>
      {role.name}
    </Link>,
    role.displayName,
    role.description ?? '-',
    <StatusBadge key={`${role.name}-active`} status={role.isActive ? 'Active' : 'Inactive'} />,
    <StatusBadge key={`${role.name}-system`} status={role.isSystem ? 'System' : 'Custom'} />,
    `${role.permissions.length}`,
    <Link className="text-brand-blue underline" href={`/admin/roles/${role.name}/edit`} key={`${role.name}-edit`}>
      Edit
    </Link>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <Header />
      <DataTable
        headers={['Name', 'Display Name', 'Description', 'Status', 'Type', 'Permissions', 'Actions']}
        rows={rows}
      />
      <Pagination
        hasNext={rolesQuery.data.pagination.hasNextPage}
        onNext={() => setPage((current) => current + 1)}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        page={page}
      />
    </main>
  );
}

function Header() {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Admin Roles</h1>
        <p className="text-sm text-slate-400">Role definitions, permission assignment, and activation controls.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/admin/roles/new">
          New Role
        </Link>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/admin/roles/permissions">
          Permissions Catalog
        </Link>
      </div>
    </section>
  );
}
