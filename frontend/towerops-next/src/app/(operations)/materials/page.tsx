'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useMaterials } from '@/hooks/use-materials';

export default function MaterialsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useMaterials(page);

  if (isLoading) return <LoadingState label="Loading materials..." />;
  if (isError || !data) return <ErrorState message="Failed to load materials" onRetry={() => refetch()} />;
  if (data.data.length === 0) return <EmptyState label="No materials found." />;

  const rows = data.data.map((m) => [
    m.code,
    m.name,
    m.category,
    `${m.currentStock} ${m.unit}`,
    <StatusBadge key={m.id} status={m.isLowStock ? 'Low' : 'In Stock'} />,
  ]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Materials</h1>
      <DataTable headers={['Code', 'Name', 'Category', 'Stock', 'Status']} rows={rows} />
      <Pagination page={page} hasNext={data.pagination.hasNextPage} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />
    </main>
  );
}
