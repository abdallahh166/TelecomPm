'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { useVisitCompletionTrends } from '@/hooks/use-analytics';
import { useOperationsKpi } from '@/hooks/use-kpi';
import { formatDateTime, formatPercent } from '@/lib/format';
import { TrendPeriod } from '@/types/analytics';

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [fromDateUtc, setFromDateUtc] = useState(dateDaysAgo(90));
  const [toDateUtc, setToDateUtc] = useState(new Date().toISOString().slice(0, 10));
  const [officeCode, setOfficeCode] = useState('');
  const [period, setPeriod] = useState<TrendPeriod>('Monthly');

  const kpiQuery = useOperationsKpi({
    fromDateUtc,
    toDateUtc,
    officeCode: officeCode.trim() || undefined,
  });

  const trendsQuery = useVisitCompletionTrends({
    fromDate: fromDateUtc,
    toDate: toDateUtc,
    period,
  });

  if (kpiQuery.isLoading || trendsQuery.isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (kpiQuery.isError || trendsQuery.isError || !kpiQuery.data || !trendsQuery.data) {
    return (
      <ErrorState
        message="Failed to load dashboard."
        onRetry={() => {
          void kpiQuery.refetch();
          void trendsQuery.refetch();
        }}
      />
    );
  }

  const kpi = kpiQuery.data;
  const trendRows = trendsQuery.data.map((item) => [
    formatDateTime(item.period),
    `${item.totalVisits}`,
    `${item.completedVisits}`,
    `${item.approvedVisits}`,
    `${item.overdueVisits}`,
    formatPercent(item.completionRate),
    formatPercent(item.approvalRate),
  ]);

  return (
    <main className="space-y-6 p-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400">Operational KPIs and completion trends from the KPI and analytics endpoints.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-400">
            <span>From</span>
            <Input type="date" value={fromDateUtc} onChange={(event) => setFromDateUtc(event.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            <span>To</span>
            <Input type="date" value={toDateUtc} onChange={(event) => setToDateUtc(event.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            <span>Office Code</span>
            <Input
              placeholder="CAI"
              value={officeCode}
              onChange={(event) => setOfficeCode(event.target.value.toUpperCase())}
            />
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            <span>Trend Period</span>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              value={period}
              onChange={(event) => setPeriod(event.target.value as TrendPeriod)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Work Orders" value={`${kpi.totalWorkOrders}`} />
        <KpiCard label="Open Work Orders" value={`${kpi.openWorkOrders}`} />
        <KpiCard label="SLA Compliance" value={formatPercent(kpi.slaCompliancePercentage)} />
        <KpiCard label="FTF Rate" value={formatPercent(kpi.ftfRatePercent)} />
        <KpiCard label="Evidence Completeness" value={formatPercent(kpi.evidenceCompletenessPercent)} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="At Risk WOs" value={`${kpi.atRiskWorkOrders}`} />
        <KpiCard label="Breached WOs" value={`${kpi.breachedWorkOrders}`} />
        <KpiCard label="Total Reviewed Visits" value={`${kpi.totalReviewedVisits}`} />
        <KpiCard label="MTTR (Hours)" value={kpi.mttrHours.toFixed(2)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Visit Completion Trends</h2>
        {trendRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No trend data for the current filter range.</p>
        ) : (
          <div className="mt-4">
            <DataTable
              headers={['Period', 'Total', 'Completed', 'Approved', 'Overdue', 'Completion', 'Approval']}
              rows={trendRows}
            />
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3 text-sm">
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/analytics">
          Open Analytics
        </Link>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/reports">
          Open Reports
        </Link>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/portal/dashboard">
          Open Portal Dashboard
        </Link>
      </section>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
