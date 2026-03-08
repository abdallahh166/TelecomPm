'use client';

import { useAuth } from '@/hooks/use-auth';
import { useSyncConflicts, useSyncStatus } from '@/hooks/use-sync';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/feedback/empty-state';

export default function SyncPage() {
  const auth = useAuth();
  const engineerId = auth.user?.id ?? '';
  const status = useSyncStatus(`device-${engineerId || 'unknown'}`);
  const conflicts = useSyncConflicts(engineerId);

  if (status.isLoading || conflicts.isLoading) return <LoadingState label="Loading sync monitor..." />;
  if (status.isError || conflicts.isError || !status.data || !conflicts.data) {
    return <ErrorState message="Failed to load sync data" onRetry={() => { status.refetch(); conflicts.refetch(); }} />;
  }

  const rows = conflicts.data.map((c) => [c.entityType, c.entityId, c.conflictType, new Date(c.createdAtUtc).toLocaleString()]);

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Sync Monitor</h1>
      <div className="rounded-lg border border-slate-800 p-4 text-sm text-slate-300">
        Device: {status.data.deviceId} — Status: {status.data.status} — Last sync:{' '}
        {new Date(status.data.lastSyncedAtUtc).toLocaleString()}
      </div>
      {rows.length === 0 ? <EmptyState label="No sync conflicts." /> : <DataTable headers={['Entity', 'ID', 'Conflict', 'Created']} rows={rows} />}
    </main>
  );
}
