'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { usePortalWorkOrders } from '@/hooks/use-portal';

export default function PortalWorkOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = usePortalWorkOrders(page);

  if (isLoading) return <LoadingState label="Loading portal work orders..." />;
  if (isError || !data) return <ErrorState message="Failed to load portal work orders" onRetry={() => refetch()} />;
  if (data.data.length === 0) return <EmptyState label="No portal work orders found." />;

  const rows = data.data.map((wo) => [wo.workOrderId, wo.siteCode, <StatusBadge key={wo.workOrderId} status={wo.status} />, wo.priority, new Date(wo.createdAt).toLocaleString()]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Client Portal / Work Orders</h1>
      <DataTable headers={['WorkOrder', 'Site', 'Status', 'Priority', 'Created']} rows={rows} />
      <Pagination page={page} hasNext={data.pagination.hasNextPage} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />
    </main>
  );
}
