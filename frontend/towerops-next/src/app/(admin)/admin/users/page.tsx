'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useUsers } from '@/hooks/use-admin';

export default function UsersAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useUsers(page);

  if (isLoading) return <LoadingState label="Loading users..." />;
  if (isError || !data) return <ErrorState message="Failed to load users" onRetry={() => refetch()} />;
  if (data.data.length === 0) return <EmptyState label="No users found." />;

  const rows = data.data.map((u) => [u.name, u.email, u.role, <StatusBadge key={u.id} status={u.isActive ? 'Active' : 'Inactive'} />]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin / Users</h1>
      <DataTable headers={['Name', 'Email', 'Role', 'Status']} rows={rows} />
      <Pagination page={page} hasNext={data.pagination.hasNextPage} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />
    </main>
  );
}
