'use client';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useEscalations } from '@/hooks/use-escalations';

export default function EscalationsPage() {
  const { data, isLoading, isError, refetch } = useEscalations();

  if (isLoading) return <LoadingState label="Loading escalations..." />;
  if (isError || !data) return <ErrorState message="Failed to load escalations" onRetry={() => refetch()} />;
  if (data.length === 0) return <EmptyState label="No escalations found." />;

  const rows = data.map((e) => [e.title, <StatusBadge key={e.id} status={e.status} />, e.severity, new Date(e.createdAt).toLocaleString()]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Escalations</h1>
      <DataTable headers={['Title', 'Status', 'Severity', 'Created']} rows={rows} />
    </main>
  );
}
