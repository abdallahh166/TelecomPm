'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { useSiteMaintenance } from '@/hooks/use-analytics';
import { formatDateTime } from '@/lib/format';

export default function SiteAnalyticsPage() {
  const params = useParams<{ siteId: string }>();
  const siteId = params.siteId;
  const query = useSiteMaintenance(siteId);

  if (query.isLoading) {
    return <LoadingState label="Loading site maintenance analytics..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load site analytics." onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const historyRows = data.maintenanceHistory.map((item) => [
    formatDateTime(item.visitDate),
    item.visitNumber,
    item.visitStatus,
    item.engineerName,
    `${item.issuesFound}`,
    `${item.issuesResolved}`,
    item.materialCost.toFixed(2),
  ]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Site Maintenance Analytics</h1>
        <p className="text-sm text-slate-400">{data.siteCode} - {data.siteName}</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/analytics">Back to analytics</Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Visits" value={`${data.totalVisits}`} />
        <StatCard label="Completed Visits" value={`${data.completedVisits}`} />
        <StatCard label="Open Issues" value={`${data.openIssues}`} />
        <StatCard label="Critical Issues" value={`${data.criticalIssues}`} />
        <StatCard label="Total Material Cost" value={`${data.totalMaterialCost.toFixed(2)}`} />
        <StatCard label="Materials Used Count" value={`${data.materialsUsedCount}`} />
        <StatCard label="Days Since Last Visit" value={`${data.daysSinceLastVisit}`} />
        <StatCard label="Region" value={data.region} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Maintenance History</h2>
        {historyRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No history records for selected period.</p>
        ) : (
          <div className="mt-4">
            <DataTable
              headers={['Visit Date', 'Visit', 'Status', 'Engineer', 'Issues Found', 'Resolved', 'Material Cost']}
              rows={historyRows}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
