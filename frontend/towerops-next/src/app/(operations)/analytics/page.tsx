'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useIssueAnalytics, useVisitCompletionTrends } from '@/hooks/use-analytics';
import { formatDateTime, formatPercent } from '@/lib/format';
import { TrendPeriod } from '@/types/analytics';

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [officeId, setOfficeId] = useState('');
  const [engineerId, setEngineerId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [fromDate, setFromDate] = useState(dateDaysAgo(90));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<TrendPeriod>('Monthly');

  const trendsQuery = useVisitCompletionTrends({
    officeId: officeId.trim() || undefined,
    engineerId: engineerId.trim() || undefined,
    fromDate,
    toDate,
    period,
  });

  const issuesQuery = useIssueAnalytics({
    officeId: officeId.trim() || undefined,
    siteId: siteId.trim() || undefined,
    fromDate,
    toDate,
  });

  if (trendsQuery.isLoading || issuesQuery.isLoading) {
    return <LoadingState label="Loading analytics..." />;
  }

  if (trendsQuery.isError || issuesQuery.isError || !trendsQuery.data || !issuesQuery.data) {
    return (
      <ErrorState
        message="Failed to load analytics."
        onRetry={() => {
          void trendsQuery.refetch();
          void issuesQuery.refetch();
        }}
      />
    );
  }

  const trendRows = trendsQuery.data.map((item) => [
    formatDateTime(item.period),
    `${item.totalVisits}`,
    `${item.completedVisits}`,
    `${item.approvedVisits}`,
    `${item.overdueVisits}`,
    formatPercent(item.completionRate),
    formatPercent(item.approvalRate),
  ]);

  const issues = issuesQuery.data;

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-slate-400">Cross-domain trends and quality analytics with quick drill-down links.</p>
      </section>

      <section className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Input placeholder="Office ID (GUID)" value={officeId} onChange={(event) => setOfficeId(event.target.value)} />
        <Input placeholder="Engineer ID (GUID)" value={engineerId} onChange={(event) => setEngineerId(event.target.value)} />
        <Input placeholder="Site ID (GUID)" value={siteId} onChange={(event) => setSiteId(event.target.value)} />
        <Input placeholder="Material ID (GUID)" value={materialId} onChange={(event) => setMaterialId(event.target.value)} />
        <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
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
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Issues" value={`${issues.totalIssues}`} />
        <StatCard label="Open Issues" value={`${issues.openIssues}`} />
        <StatCard label="Critical Issues" value={`${issues.criticalIssues}`} />
        <StatCard label="Resolution Rate" value={formatPercent(issues.resolutionRate)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Completion Trends</h2>
        {trendRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No trend data for current filters.</p>
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
        {engineerId.trim() ? (
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href={`/analytics/engineers/${engineerId.trim()}`}>
            Engineer Performance
          </Link>
        ) : null}
        {siteId.trim() ? (
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href={`/analytics/sites/${siteId.trim()}`}>
            Site Maintenance
          </Link>
        ) : null}
        {officeId.trim() ? (
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href={`/analytics/offices/${officeId.trim()}`}>
            Office Statistics
          </Link>
        ) : null}
        {materialId.trim() ? (
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href={`/analytics/materials/${materialId.trim()}`}>
            Material Usage
          </Link>
        ) : null}
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/analytics/issues">
          Issue Analytics
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
