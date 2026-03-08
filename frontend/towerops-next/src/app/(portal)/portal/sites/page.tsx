'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { usePortalSites } from '@/hooks/use-portal';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function PortalSitesPage() {
  const [page, setPage] = useState(1);
  const query = usePortalSites(page);

  if (query.isLoading) {
    return <LoadingState label="Loading portal sites..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load portal sites." onRetry={() => query.refetch()} />;
  }

  if (query.data.data.length === 0) {
    return <EmptyState label="No portal sites available." />;
  }

  const rows = query.data.data.map((site) => [
    <Link className="text-brand-blue underline" href={`/portal/sites/${site.siteCode}`} key={`${site.siteCode}-code`}>
      {site.siteCode}
    </Link>,
    site.name,
    site.region,
    <StatusBadge key={`${site.siteCode}-status`} status={site.status} />,
    formatDateTime(site.lastVisitDate),
    site.lastVisitType ? formatLabel(site.lastVisitType) : 'N/A',
    `${site.openWorkOrdersCount}`,
    `${site.breachedSlaCount}`,
    <Link className="text-brand-blue underline" href={`/portal/visits/${site.siteCode}`} key={`${site.siteCode}-visits`}>
      Visits
    </Link>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Portal Sites</h1>
        <p className="text-sm text-slate-400">Customer-facing site portfolio status and maintenance visibility.</p>
      </div>

      <DataTable
        headers={['Site', 'Name', 'Region', 'Status', 'Last Visit', 'Last Type', 'Open WOs', 'SLA Breaches', 'Visits']}
        rows={rows}
      />

      <Pagination
        page={page}
        hasNext={query.data.pagination.hasNextPage}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => current + 1)}
      />
    </main>
  );
}
