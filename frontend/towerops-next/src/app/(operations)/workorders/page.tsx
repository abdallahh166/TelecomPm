'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useWorkOrders } from '@/hooks/use-workorders';

export default function WorkOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useWorkOrders(page);

  if (isLoading) return <div className="p-6">Loading work orders...</div>;
  if (isError || !data) return <div className="p-6">Failed to load work orders.</div>;

  const rows = data.data.map((wo) => [
    <Link className="text-brand-blue underline" href={`/workorders/${wo.workOrderId}`} key="link">
      {wo.workOrderId}
    </Link>,
    wo.siteCode,
    <StatusBadge key="status" status={wo.status} />,
    wo.priority,
    new Date(wo.slaDeadline).toLocaleString(),
  ]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Work Orders</h1>
      <DataTable headers={['ID', 'Site', 'Status', 'Priority', 'SLA']} rows={rows} />
      <Pagination
        hasNext={data.pagination.hasNextPage}
        onNext={() => setPage((p) => p + 1)}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        page={page}
      />
    </main>
  );
}
