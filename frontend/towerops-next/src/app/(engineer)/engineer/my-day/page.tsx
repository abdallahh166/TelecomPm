'use client';

import { useAuth } from '@/hooks/use-auth';
import { useScheduledVisits } from '@/hooks/use-visits';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';

export default function EngineerMyDayPage() {
  const auth = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const { data, isLoading, isError, refetch } = useScheduledVisits({
    page: 1,
    engineerId: auth.user?.id,
    date: today,
  });

  if (isLoading) return <LoadingState label="Loading your day plan..." />;
  if (isError || !data) return <ErrorState message="Failed to load engineer day plan" onRetry={() => refetch()} />;
  if (data.data.length === 0) return <EmptyState label="No scheduled visits for today." />;

  const rows = data.data.map((v) => [v.visitNumber, v.siteCode, v.siteName, new Date(v.scheduledDate).toLocaleTimeString(), <StatusBadge key={v.id} status={v.status} />, v.type]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Engineer / My Day</h1>
      <DataTable headers={['Visit #', 'Site', 'Name', 'Time', 'Status', 'Type']} rows={rows} />
    </main>
  );
}
