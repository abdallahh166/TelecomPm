'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { useOfficeStatistics } from '@/hooks/use-analytics';
import { formatPercent } from '@/lib/format';

export default function OfficeAnalyticsPage() {
  const params = useParams<{ officeId: string }>();
  const officeId = params.officeId;
  const query = useOfficeStatistics(officeId);

  if (query.isLoading) {
    return <LoadingState label="Loading office statistics..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load office analytics." onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const engineerRows = data.topEngineers.map((item) => [
    item.engineerName,
    `${item.assignedSites}`,
    `${item.completedVisits}`,
    formatPercent(item.completionRate),
    item.performanceRating?.toFixed(2) ?? 'N/A',
  ]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Office Statistics</h1>
        <p className="text-sm text-slate-400">{data.officeCode} - {data.officeName}</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/analytics">Back to analytics</Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Sites" value={`${data.totalSites}`} />
        <StatCard label="Scheduled Visits" value={`${data.scheduledVisits}`} />
        <StatCard label="Approved Visits" value={`${data.approvedVisits}`} />
        <StatCard label="Low Stock Materials" value={`${data.lowStockMaterials}`} />
        <StatCard label="Total Users" value={`${data.totalUsers}`} />
        <StatCard label="Open Issues" value={`${data.openIssues}`} />
        <StatCard label="Visit Completion" value={formatPercent(data.averageVisitCompletionRate)} />
        <StatCard label="Visit Approval" value={formatPercent(data.averageVisitApprovalRate)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Top Engineers</h2>
        {engineerRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No engineer summary data available.</p>
        ) : (
          <div className="mt-4">
            <DataTable
              headers={['Engineer', 'Assigned Sites', 'Completed Visits', 'Completion Rate', 'Rating']}
              rows={engineerRows}
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
