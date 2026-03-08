'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { useEngineerPerformance } from '@/hooks/use-analytics';
import { formatDateTime, formatPercent } from '@/lib/format';

export default function EngineerAnalyticsPage() {
  const params = useParams<{ engineerId: string }>();
  const engineerId = params.engineerId;
  const query = useEngineerPerformance(engineerId);

  if (query.isLoading) {
    return <LoadingState label="Loading engineer performance..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load engineer analytics." onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const specializationsRows = data.specializations.map((item) => [item]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Engineer Performance</h1>
        <p className="text-sm text-slate-400">{data.engineerName} ({data.engineerEmail})</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/analytics">Back to analytics</Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Visits" value={`${data.totalVisits}`} />
        <StatCard label="Completed Visits" value={`${data.completedVisits}`} />
        <StatCard label="Approval Rate" value={formatPercent(data.approvalRate)} />
        <StatCard label="On-Time Rate" value={formatPercent(data.onTimeRate)} />
        <StatCard label="Completion Rate" value={formatPercent(data.completionRate)} />
        <StatCard label="Capacity Utilization" value={formatPercent(data.capacityUtilization)} />
        <StatCard label="Performance Rating" value={data.performanceRating?.toFixed(2) ?? 'N/A'} />
        <StatCard label="Avg Visit Duration (h)" value={data.averageVisitDuration.toFixed(2)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Period</h2>
        <p className="mt-3 text-sm text-slate-300">
          {formatDateTime(data.fromDate)} - {formatDateTime(data.toDate)}
        </p>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Specializations</h2>
        {specializationsRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No specializations listed.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Specialization']} rows={specializationsRows} />
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
