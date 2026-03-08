'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { useCustomerAcceptWorkOrder, useCustomerRejectWorkOrder, useWorkOrder } from '@/hooks/use-workorders';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime } from '@/lib/format';

export default function WorkOrderAcceptancePage() {
  const params = useParams<{ id: string }>();
  const workOrderId = params.id;
  const workOrderQuery = useWorkOrder(workOrderId);
  const acceptMutation = useCustomerAcceptWorkOrder(workOrderId);
  const rejectMutation = useCustomerRejectWorkOrder(workOrderId);
  const [acceptedBy, setAcceptedBy] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (workOrderQuery.isLoading) {
    return <LoadingState label="Loading work order..." />;
  }

  if (workOrderQuery.isError || !workOrderQuery.data) {
    return <ErrorState message="Failed to load work order." onRetry={() => workOrderQuery.refetch()} />;
  }

  const workOrder = workOrderQuery.data;
  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Customer Acceptance</h1>
          <p className="text-sm text-slate-400">Process customer acceptance decision for work order {workOrder.woNumber}.</p>
        </div>
        <StatusBadge status={workOrder.status} />
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/workorders/${workOrderId}`}>
          Back to work order details
        </Link>
      </section>

      {feedback ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="WO Number" value={workOrder.woNumber} />
        <InfoCard label="Site" value={workOrder.siteCode} />
        <InfoCard label="Scheduled Visit" value={formatDateTime(workOrder.scheduledVisitDateUtc)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Accept</h2>
          <Input
            onChange={(event) => setAcceptedBy(event.target.value)}
            placeholder="Accepted by (customer name)"
            value={acceptedBy}
          />
          <Button
            disabled={isBusy || !acceptedBy.trim()}
            onClick={async () => {
              try {
                await acceptMutation.mutateAsync({ acceptedBy: acceptedBy.trim() });
                setFeedback({ tone: 'success', message: 'Work order accepted by customer.' });
                await workOrderQuery.refetch();
              } catch (error) {
                setFeedback({ tone: 'error', message: toApiError(error).message });
              }
            }}
            type="button"
          >
            Accept Work Order
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Reject</h2>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Reason for rejection"
            value={rejectReason}
          />
          <Button
            disabled={isBusy || !rejectReason.trim()}
            onClick={async () => {
              try {
                await rejectMutation.mutateAsync({ reason: rejectReason.trim() });
                setFeedback({ tone: 'success', message: 'Work order rejected by customer.' });
                await workOrderQuery.refetch();
              } catch (error) {
                setFeedback({ tone: 'error', message: toApiError(error).message });
              }
            }}
            type="button"
            variant="danger"
          >
            Reject Work Order
          </Button>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
