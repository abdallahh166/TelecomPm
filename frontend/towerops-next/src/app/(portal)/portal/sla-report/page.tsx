'use client';

import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { usePortalSlaReport } from '@/hooks/use-portal';
import { formatPercent } from '@/lib/format';

export default function PortalSlaReportPage() {
  const query = usePortalSlaReport();

  if (query.isLoading) {
    return <LoadingState label="Loading SLA report..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load SLA report." onRetry={() => query.refetch()} />;
  }

  const rows = query.data.monthly.map((item) => [
    `${item.year}-${item.month.toString().padStart(2, '0')}`,
    item.slaClass,
    formatPercent(item.compliancePercent),
    `${item.breachCount}`,
    item.averageResponseMinutes.toFixed(2),
  ]);

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Portal SLA Report</h1>
        <p className="text-sm text-slate-400">Monthly compliance and breach trend for portal visibility.</p>
      </section>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
          No SLA report data available.
        </div>
      ) : (
        <DataTable
          headers={['Period', 'SLA Class', 'Compliance', 'Breaches', 'Avg Response (min)']}
          rows={rows}
        />
      )}
    </main>
  );
}
