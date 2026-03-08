'use client';

import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { KpiCard } from '@/components/ui/kpi-card';
import { usePortalDashboard } from '@/hooks/use-portal';

export default function PortalDashboardPage() {
  const { data, isLoading, isError, refetch } = usePortalDashboard();

  if (isLoading) return <LoadingState label="Loading portal dashboard..." />;
  if (isError || !data) return <ErrorState message="Failed to load portal dashboard" onRetry={() => refetch()} />;

  const entries = Object.entries(data as Record<string, string | number>);

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Client Portal Dashboard</h1>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {entries.map(([key, value]) => (
          <KpiCard key={key} label={key} value={String(value)} />
        ))}
      </section>
    </main>
  );
}
