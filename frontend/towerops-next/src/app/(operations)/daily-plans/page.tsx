'use client';

import { useMemo } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/use-auth';
import { useDailyPlans } from '@/hooks/use-daily-plans';

export default function DailyPlansPage() {
  const auth = useAuth();
  const date = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { data, isLoading, isError, refetch } = useDailyPlans(auth.user?.officeId ?? '', date);

  if (isLoading) return <LoadingState label="Loading daily plans..." />;
  if (isError || !data) return <ErrorState message="Failed to load daily plans" onRetry={() => refetch()} />;
  if (data.length === 0) return <EmptyState label="No daily plans found for today." />;

  const rows = data.map((p) => [p.planId, p.officeId, p.date, p.status, p.assignedCount]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Daily Plans</h1>
      <DataTable headers={['Plan ID', 'Office', 'Date', 'Status', 'Assigned']} rows={rows} />
    </main>
  );
}
