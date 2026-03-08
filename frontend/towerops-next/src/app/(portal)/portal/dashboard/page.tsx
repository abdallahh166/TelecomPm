'use client';

import Link from 'next/link';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { usePortalDashboard, usePortalSlaReport } from '@/hooks/use-portal';
import { formatPercent } from '@/lib/format';

export default function PortalDashboardPage() {
  const dashboardQuery = usePortalDashboard();
  const slaQuery = usePortalSlaReport();

  if (dashboardQuery.isLoading || slaQuery.isLoading) {
    return <LoadingState label="Loading portal dashboard..." />;
  }

  if (dashboardQuery.isError || slaQuery.isError || !dashboardQuery.data || !slaQuery.data) {
    return (
      <ErrorState
        message="Failed to load portal dashboard."
        onRetry={() => {
          void dashboardQuery.refetch();
          void slaQuery.refetch();
        }}
      />
    );
  }

  const dashboard = dashboardQuery.data;
  const latestMetric = slaQuery.data.monthly[0];

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Portal Dashboard</h1>
        <p className="text-sm text-slate-400">Client-facing operational transparency summary.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Sites" value={`${dashboard.totalSites}`} />
        <StatCard label="On-Air %" value={formatPercent(dashboard.onAirPercent)} />
        <StatCard label="SLA Compliance %" value={formatPercent(dashboard.slaComplianceRatePercent)} />
        <StatCard label="Pending CM" value={`${dashboard.pendingCmCount}`} />
        <StatCard label="Overdue BM" value={`${dashboard.overdueBmCount}`} />
      </section>

      {latestMetric ? (
        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Latest SLA Snapshot</h2>
          <p className="mt-3 text-sm text-slate-300">
            {latestMetric.year}-{latestMetric.month.toString().padStart(2, '0')} / {latestMetric.slaClass}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <StatCard label="Compliance" value={formatPercent(latestMetric.compliancePercent)} />
            <StatCard label="Breaches" value={`${latestMetric.breachCount}`} />
            <StatCard label="Avg Response (min)" value={latestMetric.averageResponseMinutes.toFixed(2)} />
          </div>
        </section>
      ) : null}

      <section className="flex flex-wrap gap-3 text-sm">
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/portal/sites">
          Portal Sites
        </Link>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/portal/workorders">
          Portal Work Orders
        </Link>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/portal/sla-report">
          SLA Report
        </Link>
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
