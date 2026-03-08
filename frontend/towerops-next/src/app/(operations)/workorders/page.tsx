'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useWorkOrders } from '@/hooks/use-workorders';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function WorkOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useWorkOrders(page);

  if (isLoading) return <LoadingState label="Loading work orders..." />;
  if (isError || !data) return <ErrorState message="Failed to load work orders." onRetry={() => refetch()} />;
  if (data.data.length === 0) return <EmptyState label="No work orders are available." />;

  const rows = data.data.map((wo) => [
    <Link className="text-brand-blue underline" href={`/workorders/${wo.id}`} key={`${wo.id}-link`}>
      {wo.woNumber}
    </Link>,
    wo.siteCode,
    <StatusBadge key="status" status={wo.status} />,
    <StatusBadge key="priority" status={wo.slaClass} />,
    formatLabel(wo.workOrderType),
    formatDateTime(wo.resolutionDeadlineUtc),
  ]);

  return (
    <main className="p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Work Orders</h1>
          <p className="text-sm text-slate-400">Operations queue aligned to the internal work order workflow.</p>
        </div>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/workorders/new">
          New Work Order
        </Link>
      </div>
      <DataTable headers={['WO Number', 'Site', 'Status', 'Priority', 'Type', 'Resolution SLA']} rows={rows} />
      <Pagination
        hasNext={data.pagination.hasNextPage}
        onNext={() => setPage((p) => p + 1)}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        page={page}
      />
    </main>
  );
}
