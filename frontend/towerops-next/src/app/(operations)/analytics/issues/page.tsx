'use client';

import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useIssueAnalytics } from '@/hooks/use-analytics';
import { formatDateTime, formatPercent } from '@/lib/format';

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function IssueAnalyticsPage() {
  const [officeId, setOfficeId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [fromDate, setFromDate] = useState(dateDaysAgo(90));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const query = useIssueAnalytics({
    officeId: officeId.trim() || undefined,
    siteId: siteId.trim() || undefined,
    fromDate,
    toDate,
  });

  if (query.isLoading) {
    return <LoadingState label="Loading issue analytics..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load issue analytics." onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const categoryRows = data.issuesByCategory.map((item) => [
    item.category,
    `${item.totalCount}`,
    `${item.openCount}`,
    `${item.resolvedCount}`,
  ]);

  const severityRows = data.issuesBySeverity.map((item) => [
    item.severity,
    `${item.totalCount}`,
    `${item.openCount}`,
    `${item.resolvedCount}`,
  ]);

  const siteRows = data.topSitesWithIssues.map((item) => [
    item.siteCode,
    item.siteName,
    `${item.totalIssues}`,
    `${item.openIssues}`,
    `${item.criticalIssues}`,
  ]);

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Issue Analytics</h1>
        <p className="text-sm text-slate-400">
          {formatDateTime(data.fromDate)} - {formatDateTime(data.toDate)}
        </p>
      </section>

      <section className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Input placeholder="Office ID (GUID)" value={officeId} onChange={(event) => setOfficeId(event.target.value)} />
        <Input placeholder="Site ID (GUID)" value={siteId} onChange={(event) => setSiteId(event.target.value)} />
        <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Issues" value={`${data.totalIssues}`} />
        <StatCard label="Open Issues" value={`${data.openIssues}`} />
        <StatCard label="Resolved Issues" value={`${data.resolvedIssues}`} />
        <StatCard label="Resolution Rate" value={formatPercent(data.resolutionRate)} />
        <StatCard label="Critical" value={`${data.criticalIssues}`} />
        <StatCard label="High" value={`${data.highIssues}`} />
        <StatCard label="Medium" value={`${data.mediumIssues}`} />
        <StatCard label="Low" value={`${data.lowIssues}`} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">By Category</h2>
        {categoryRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No category data.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Category', 'Total', 'Open', 'Resolved']} rows={categoryRows} />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">By Severity</h2>
        {severityRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No severity data.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Severity', 'Total', 'Open', 'Resolved']} rows={severityRows} />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Top Sites With Issues</h2>
        {siteRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No site issue data.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Site Code', 'Site Name', 'Total', 'Open', 'Critical']} rows={siteRows} />
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
