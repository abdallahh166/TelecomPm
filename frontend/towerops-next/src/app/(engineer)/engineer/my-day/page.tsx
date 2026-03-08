'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { useEngineerVisits } from '@/hooks/use-visits';
import { formatDateTime, formatPercent, formatLabel } from '@/lib/format';

function getTodayRange() {
  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export default function EngineerMyDayPage() {
  const auth = useAuth();
  const [page, setPage] = useState(1);
  const filters = useMemo(() => getTodayRange(), []);
  const query = useEngineerVisits(auth.user?.id, page, filters, Boolean(auth.user?.id));

  if (query.isLoading) return <LoadingState label="Loading today visits..." />;
  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load engineer day queue." onRetry={() => query.refetch()} />;
  }
  if (query.data.data.length === 0) {
    return (
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Engineer My Day</h1>
        <EmptyState label="No visits assigned for today." />
      </main>
    );
  }

  const rows = query.data.data.map((visit) => [
    <Link className="text-brand-blue underline" href={`/engineer/visits/${visit.id}/execute`} key={`${visit.id}-visit`}>
      {visit.visitNumber}
    </Link>,
    `${visit.siteName} (${visit.siteCode})`,
    <StatusBadge key={`${visit.id}-status`} status={visit.status} />,
    formatLabel(visit.type),
    formatDateTime(visit.scheduledDate),
    formatPercent(visit.completionPercentage),
    <div className="flex gap-2" key={`${visit.id}-actions`}>
      <Link className="text-brand-blue underline" href={`/engineer/visits/${visit.id}/execute`}>
        Execute
      </Link>
      <Link className="text-brand-blue underline" href={`/engineer/visits/${visit.id}/evidence`}>
        Evidence
      </Link>
    </div>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Engineer My Day</h1>
        <p className="text-sm text-slate-400">
          Daily field board for assigned engineer visits, with direct execution and evidence entry points.
        </p>
      </section>

      <DataTable
        headers={['Visit', 'Site', 'Status', 'Type', 'Scheduled', 'Completion', 'Actions']}
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
