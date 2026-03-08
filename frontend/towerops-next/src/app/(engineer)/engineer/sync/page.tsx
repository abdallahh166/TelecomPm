'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { useProcessSyncBatch, useSyncStatus } from '@/hooks/use-sync';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function EngineerSyncPage() {
  const auth = useAuth();
  const defaultDeviceId = useMemo(
    () => `engineer-web-${(auth.user?.id ?? 'unknown').slice(0, 8)}`,
    [auth.user?.id],
  );
  const [deviceId, setDeviceId] = useState(defaultDeviceId);
  const [activeDeviceId, setActiveDeviceId] = useState(defaultDeviceId);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const statusQuery = useSyncStatus(activeDeviceId, Boolean(activeDeviceId));
  const processBatchMutation = useProcessSyncBatch();

  const triggerBatchPing = async () => {
    try {
      const result = await processBatchMutation.mutateAsync({
        deviceId: activeDeviceId,
        engineerId: auth.user?.id,
        items: [
          {
            operationType: 'heartbeat',
            payload: JSON.stringify({ source: 'towerops-next', at: new Date().toISOString() }),
            createdOnDeviceUtc: new Date().toISOString(),
          },
        ],
      });

      setFeedback({
        tone: 'success',
        message: `Batch processed: ${result.processed} processed, ${result.conflicts} conflicts, ${result.failed} failed.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: toApiError(error).message,
      });
    }
  };

  const applyDevice = () => {
    if (!deviceId.trim()) {
      setFeedback({ tone: 'error', message: 'Device ID is required.' });
      return;
    }

    setActiveDeviceId(deviceId.trim());
  };

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Engineer Sync</h1>
        <p className="text-sm text-slate-400">
          Monitor device sync queue status and run a lightweight batch ping.
        </p>
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

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Target Device</h2>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <Input value={deviceId} onChange={(event) => setDeviceId(event.target.value)} />
          <Button type="button" variant="secondary" onClick={applyDevice}>
            Load Status
          </Button>
          <Button
            type="button"
            onClick={triggerBatchPing}
            disabled={processBatchMutation.isPending || !activeDeviceId}
          >
            Send Batch Ping
          </Button>
        </div>
      </section>

      {statusQuery.isLoading ? <LoadingState label="Loading sync status..." /> : null}
      {statusQuery.isError ? (
        <ErrorState message="Failed to load sync status." onRetry={() => statusQuery.refetch()} />
      ) : null}
      {statusQuery.data ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <MetricCard label="Total" value={statusQuery.data.total.toString()} />
            <MetricCard label="Pending" value={statusQuery.data.pending.toString()} />
            <MetricCard label="Processed" value={statusQuery.data.processed.toString()} />
            <MetricCard label="Conflicts" value={statusQuery.data.conflicts.toString()} />
            <MetricCard label="Failed" value={statusQuery.data.failed.toString()} />
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Queue Items</h2>
            {statusQuery.data.items.length === 0 ? (
              <EmptyState label="No sync items found for this device." />
            ) : (
              <DataTable
                headers={['Operation', 'Created On Device', 'Status', 'Retry Count', 'Conflict']}
                rows={statusQuery.data.items.map((item) => [
                  formatLabel(item.operationType),
                  formatDateTime(item.createdOnDeviceUtc),
                  <StatusBadge key={`${item.id}-status`} status={item.status} />,
                  item.retryCount.toString(),
                  item.conflictReason ?? 'None',
                ])}
              />
            )}
          </section>
        </>
      ) : null}

      <div className="text-sm">
        <Link className="text-brand-blue underline" href="/engineer/sync/conflicts">
          Open Sync Conflicts
        </Link>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
