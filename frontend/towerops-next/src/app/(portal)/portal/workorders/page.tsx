'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAcceptPortalWorkOrder, usePortalWorkOrders, useRejectPortalWorkOrder } from '@/hooks/use-portal';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function PortalWorkOrdersPage() {
  const [page, setPage] = useState(1);
  const query = usePortalWorkOrders(page);
  const acceptMutation = useAcceptPortalWorkOrder();
  const rejectMutation = useRejectPortalWorkOrder();
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (query.isLoading) {
    return <LoadingState label="Loading portal work orders..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load portal work orders." onRetry={() => query.refetch()} />;
  }

  if (query.data.data.length === 0) {
    return <EmptyState label="No portal work orders found." />;
  }

  const rows = query.data.data.map((workOrder) => [
    workOrder.workOrderId,
    workOrder.siteCode,
    <StatusBadge key={`${workOrder.workOrderId}-status`} status={workOrder.status} />,
    formatLabel(workOrder.priority),
    formatDateTime(workOrder.slaDeadline),
    formatDateTime(workOrder.createdAt),
    formatDateTime(workOrder.completedAt),
    <div className="flex gap-2" key={`${workOrder.workOrderId}-actions`}>
      <Button
        type="button"
        variant="secondary"
        disabled={acceptMutation.isPending || rejectMutation.isPending}
        onClick={async () => {
          try {
            await acceptMutation.mutateAsync(workOrder.workOrderId);
            setFeedback({ tone: 'success', message: `Work order ${workOrder.workOrderId} accepted.` });
            await query.refetch();
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
      >
        Accept
      </Button>
      <Button
        type="button"
        variant="danger"
        disabled={acceptMutation.isPending || rejectMutation.isPending}
        onClick={async () => {
          const reason = window.prompt('Rejection reason');
          if (!reason || !reason.trim()) {
            return;
          }

          try {
            await rejectMutation.mutateAsync({
              id: workOrder.workOrderId,
              payload: { reason: reason.trim() },
            });
            setFeedback({ tone: 'success', message: `Work order ${workOrder.workOrderId} rejected.` });
            await query.refetch();
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
      >
        Reject
      </Button>
    </div>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Portal Work Orders</h1>
        <p className="text-sm text-slate-400">Customer acceptance and rejection workflow for completed work orders.</p>
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

      <DataTable
        headers={['Work Order', 'Site', 'Status', 'Priority', 'SLA Deadline', 'Created', 'Completed', 'Actions']}
        rows={rows}
      />

      <Pagination
        page={page}
        hasNext={query.data.pagination.hasNextPage}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => current + 1)}
      />
    </main>
  );
}
