'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useFaultyAssets } from '@/hooks/use-assets';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';

export default function AssetsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError, refetch } = useFaultyAssets();

  if (isLoading) return <LoadingState label="Loading assets..." />;
  if (isError || !data) return <ErrorState message="Failed to load faulty assets" onRetry={() => refetch()} />;
  if (data.length === 0) return <EmptyState label="No faulty assets found." />;

  const start = (page - 1) * pageSize;
  const paged = data.slice(start, start + pageSize);
  const hasNext = start + pageSize < data.length;

  const rows = paged.map((asset) => [
    asset.assetCode,
    asset.siteCode,
    asset.name,
    asset.category,
    <StatusBadge key={asset.assetCode} status={asset.status} />,
    asset.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate).toLocaleDateString() : '-',
  ]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Assets</h1>
      <DataTable headers={['Asset', 'Site', 'Name', 'Category', 'Status', 'Warranty']} rows={rows} />
      <Pagination
        page={page}
        hasNext={hasNext}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    </main>
  );
}
