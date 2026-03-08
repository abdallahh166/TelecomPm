'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { usePortalVisits } from '@/hooks/use-portal';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function PortalVisitsBySitePage() {
  const params = useParams<{ id: string }>();
  const siteCode = params.id;
  const [page, setPage] = useState(1);
  const query = usePortalVisits(siteCode, page);

  if (query.isLoading) {
    return <LoadingState label="Loading portal visits..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load portal visits." onRetry={() => query.refetch()} />;
  }

  if (query.data.data.length === 0) {
    return <EmptyState label={`No visits found for site ${siteCode}.`} />;
  }

  const rows = query.data.data.map((visit) => [
    visit.visitNumber,
    <StatusBadge key={`${visit.visitId}-status`} status={visit.status} />,
    formatLabel(visit.type),
    formatDateTime(visit.scheduledDate),
    visit.engineerDisplayName,
    <Link className="text-brand-blue underline" href={`/portal/visits/${visit.visitId}/evidence`} key={`${visit.visitId}-evidence`}>
      Evidence
    </Link>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Portal Visits - {siteCode}</h1>
        <p className="text-sm text-slate-400">Visit history and evidence links for this site.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/portal/sites">
          Back to portal sites
        </Link>
      </section>

      <DataTable
        headers={['Visit Number', 'Status', 'Type', 'Scheduled', 'Engineer', 'Evidence']}
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
