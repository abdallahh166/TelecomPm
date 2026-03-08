'use client';

import { useParams } from 'next/navigation';
import { ActionButton } from '@/components/ui/action-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useVisit, useVisitLifecycleActions } from '@/hooks/use-visits';

export default function VisitDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading, isError } = useVisit(id);
  const actions = useVisitLifecycleActions(id);

  if (isLoading) return <div className="p-6">Loading visit...</div>;
  if (isError || !data) return <div className="p-6">Failed to load visit.</div>;

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Visit {data.visitNumber}</h1>
      <div className="rounded-lg border border-slate-800 p-4">
        <p className="mb-2 text-slate-300">{data.siteCode} — {data.siteName}</p>
        <p className="mb-2 text-sm text-slate-400">Engineer: {data.engineerName}</p>
        <p className="mb-4 text-sm text-slate-400">Scheduled: {new Date(data.scheduledDate).toLocaleString()}</p>
        <div className="mb-4 flex gap-3">
          <StatusBadge status={data.status} />
          <StatusBadge status={data.type} />
        </div>
        {data.notes ? <p className="mb-4 text-sm text-slate-300">{data.notes}</p> : null}

        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary" onClick={() => actions.start.mutate()}>
            Start Visit
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => actions.complete.mutate()}>
            Complete Visit
          </ActionButton>
          <ActionButton variant="danger" onClick={() => actions.cancel.mutate()}>
            Cancel Visit
          </ActionButton>
        </div>
      </div>
    </main>
  );
}
