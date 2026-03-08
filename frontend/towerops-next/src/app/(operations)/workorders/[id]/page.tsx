'use client';

import { useParams } from 'next/navigation';
import { StatusBadge } from '@/components/ui/status-badge';
import { useWorkOrder, useWorkOrderLifecycleActions } from '@/hooks/use-workorders';
import { ActionButton } from '@/components/ui/action-button';

export default function WorkOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading, isError } = useWorkOrder(id);
  const actions = useWorkOrderLifecycleActions(id);

  if (isLoading) return <div className="p-6">Loading work order...</div>;
  if (isError || !data) return <div className="p-6">Failed to load work order.</div>;

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Work Order {data.id}</h1>
      <div className="rounded-lg border border-slate-800 p-4">
        <p className="mb-2 text-slate-300">{data.title}</p>
        <p className="mb-4 text-sm text-slate-400">{data.description}</p>
        <div className="mb-4 flex gap-3">
          <StatusBadge status={data.status} />
          <StatusBadge status={data.priority} />
          <span className="text-sm text-slate-300">Site: {data.siteCode}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary" onClick={() => actions.start.mutate()}>
            Start
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => actions.complete.mutate()}>
            Complete
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => actions.close.mutate()}>
            Close
          </ActionButton>
          <ActionButton variant="danger" onClick={() => actions.cancel.mutate()}>
            Cancel
          </ActionButton>
        </div>
      </div>
    </main>
  );
}
