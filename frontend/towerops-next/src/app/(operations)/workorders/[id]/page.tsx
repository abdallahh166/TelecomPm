'use client';

import { useParams } from 'next/navigation';
import { StatusBadge } from '@/components/ui/status-badge';
import { useWorkOrder } from '@/hooks/use-workorders';

export default function WorkOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useWorkOrder(params.id);

  if (isLoading) return <div className="p-6">Loading work order...</div>;
  if (isError || !data) return <div className="p-6">Failed to load work order.</div>;

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Work Order {data.id}</h1>
      <div className="rounded-lg border border-slate-800 p-4">
        <p className="mb-2 text-slate-300">{data.title}</p>
        <p className="mb-4 text-sm text-slate-400">{data.description}</p>
        <div className="flex gap-3">
          <StatusBadge status={data.status} />
          <StatusBadge status={data.priority} />
          <span className="text-sm text-slate-300">Site: {data.siteCode}</span>
        </div>
      </div>
    </main>
  );
}
