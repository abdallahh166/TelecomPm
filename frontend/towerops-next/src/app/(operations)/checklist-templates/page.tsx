'use client';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useChecklistTemplates } from '@/hooks/use-checklist-templates';

export default function ChecklistTemplatesPage() {
  const { data, isLoading, isError, refetch } = useChecklistTemplates();

  if (isLoading) return <LoadingState label="Loading checklist templates..." />;
  if (isError || !data) return <ErrorState message="Failed to load checklist templates" onRetry={() => refetch()} />;
  if (data.length === 0) return <EmptyState label="No checklist templates found." />;

  const rows = data.map((t) => [t.name, `v${t.version}`, <StatusBadge key={t.id} status={t.isActive ? 'Active' : 'Inactive'} />, new Date(t.createdAtUtc).toLocaleString()]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Checklist Templates</h1>
      <DataTable headers={['Name', 'Version', 'Status', 'Created']} rows={rows} />
    </main>
  );
}
