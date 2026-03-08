'use client';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/use-auth';
import { useSyncConflicts } from '@/hooks/use-sync';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function EngineerSyncConflictsPage() {
  const auth = useAuth();
  const conflictsQuery = useSyncConflicts(auth.user?.id, Boolean(auth.user?.id));

  if (conflictsQuery.isLoading) return <LoadingState label="Loading sync conflicts..." />;
  if (conflictsQuery.isError || !conflictsQuery.data) {
    return <ErrorState message="Failed to load sync conflicts." onRetry={() => conflictsQuery.refetch()} />;
  }

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Engineer Sync Conflicts</h1>
        <p className="text-sm text-slate-400">
          Resolved sync conflicts returned by the backend conflict log.
        </p>
      </section>

      {conflictsQuery.data.length === 0 ? (
        <EmptyState label="No sync conflicts found." />
      ) : (
        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <DataTable
            headers={['Conflict Type', 'Sync Queue ID', 'Resolution', 'Resolved At']}
            rows={conflictsQuery.data.map((conflict) => [
              formatLabel(conflict.conflictType),
              conflict.syncQueueId,
              conflict.resolution,
              formatDateTime(conflict.resolvedAtUtc),
            ])}
          />
        </section>
      )}
    </main>
  );
}
