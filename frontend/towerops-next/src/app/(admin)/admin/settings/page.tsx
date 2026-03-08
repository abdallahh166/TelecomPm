'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useSettings } from '@/hooks/use-admin';

export default function SettingsAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useSettings(page);

  if (isLoading) return <LoadingState label="Loading settings..." />;
  if (isError || !data) return <ErrorState message="Failed to load settings" onRetry={() => refetch()} />;
  if (data.data.length === 0) return <EmptyState label="No settings found." />;

  const rows = data.data.map((s) => [s.group, s.key, s.value]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin / Settings</h1>
      <DataTable headers={['Group', 'Key', 'Value']} rows={rows} />
      <Pagination page={page} hasNext={data.pagination.hasNextPage} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />
    </main>
  );
}
