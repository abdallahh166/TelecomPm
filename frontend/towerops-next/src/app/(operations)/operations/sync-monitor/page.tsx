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
import { useSyncStatus } from '@/hooks/use-sync';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function OperationsSyncMonitorPage() {
  const auth = useAuth();
  const defaultDeviceId = useMemo(
    () => `engineer-web-${(auth.user?.id ?? 'unknown').slice(0, 8)}`,
    [auth.user?.id],
  );
  const [deviceInput, setDeviceInput] = useState(defaultDeviceId);
  const [deviceId, setDeviceId] = useState(defaultDeviceId);
  const statusQuery = useSyncStatus(deviceId, Boolean(deviceId));

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Sync Monitor</h1>
        <p className="text-sm text-slate-400">
          Operations monitor for sync queue status by device.
        </p>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Device Lookup</h2>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <Input value={deviceInput} onChange={(event) => setDeviceInput(event.target.value)} />
          <Button type="button" variant="secondary" onClick={() => setDeviceId(deviceInput.trim())}>
            Load
          </Button>
          <Button type="button" variant="secondary" onClick={() => statusQuery.refetch()}>
            Refresh
          </Button>
        </div>
      </section>

      {statusQuery.isLoading ? <LoadingState label="Loading sync status..." /> : null}
      {statusQuery.isError ? (
        <ErrorState message="Failed to load sync status for selected device." onRetry={() => statusQuery.refetch()} />
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
            <h2 className="text-lg font-semibold">Status Items</h2>
            {statusQuery.data.items.length === 0 ? (
              <EmptyState label="No items found for selected device." />
            ) : (
              <DataTable
                headers={['Operation', 'Created On Device', 'Status', 'Retries', 'Conflict']}
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
          Open Engineer Conflict View
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
