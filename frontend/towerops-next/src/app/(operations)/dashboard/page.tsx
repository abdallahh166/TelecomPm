'use client';

import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { PerformanceChart } from '@/components/charts/performance-chart';
import { KpiCard } from '@/components/ui/kpi-card';
import { useOperationsKpi } from '@/hooks/use-kpi';

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useOperationsKpi();

  if (isLoading) return <LoadingState label="Loading dashboard..." />;
  if (isError || !data) return <ErrorState message="Failed to load KPI dashboard" onRetry={() => refetch()} />;

  const chartData = [
    { name: 'Open WOs', value: data.openWorkOrders },
    { name: 'Visits', value: data.visitsToday },
    { name: 'Escalations', value: data.openEscalations },
  ];

  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Open Work Orders" value={data.openWorkOrders} />
        <KpiCard label="Visits Today" value={data.visitsToday} />
        <KpiCard label="Completion Rate" value={`${data.completionRate}%`} />
        <KpiCard label="SLA Compliance" value={`${data.slaCompliance}%`} />
        <KpiCard label="Open Escalations" value={data.openEscalations} />
      </section>
      <PerformanceChart data={chartData} />
    </main>
  );
}
