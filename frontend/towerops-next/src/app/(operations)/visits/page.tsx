'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { usePendingReviewVisits, useScheduledVisits } from '@/hooks/use-visits';
import { formatDateTime, formatPercent, formatLabel } from '@/lib/format';

type TabKey = 'scheduled' | 'pending-reviews';

export default function VisitsPage() {
  const auth = useAuth();
  const [tab, setTab] = useState<TabKey>('scheduled');
  const [page, setPage] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const scheduledQuery = useScheduledVisits(date, page, tab === 'scheduled');
  const pendingReviewsQuery = usePendingReviewVisits(auth.user?.officeId, page, tab === 'pending-reviews');
  const activeQuery = tab === 'scheduled' ? scheduledQuery : pendingReviewsQuery;

  if (activeQuery.isLoading) {
    return <LoadingState label={`Loading ${tab === 'scheduled' ? 'scheduled visits' : 'pending reviews'}...`} />;
  }

  if (activeQuery.isError || !activeQuery.data) {
    return (
      <ErrorState
        message={`Failed to load ${tab === 'scheduled' ? 'scheduled visits' : 'pending review visits'}.`}
        onRetry={() => activeQuery.refetch()}
      />
    );
  }

  if (activeQuery.data.data.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <VisitsHeader date={date} onDateChange={setDate} onTabChange={setTab} tab={tab} />
        <EmptyState
          label={
            tab === 'scheduled'
              ? 'No scheduled visits were found for the selected date.'
              : 'No visits are waiting for review.'
          }
        />
      </main>
    );
  }

  const rows = activeQuery.data.data.map((visit) => [
    <Link className="text-brand-blue underline" href={`/visits/${visit.id}`} key={`${visit.id}-link`}>
      {visit.visitNumber}
    </Link>,
    `${visit.siteName} (${visit.siteCode})`,
    visit.engineerName,
    <StatusBadge key={`${visit.id}-status`} status={visit.status} />,
    formatLabel(visit.type),
    formatDateTime(visit.scheduledDate),
    formatPercent(visit.completionPercentage),
  ]);

  return (
    <main className="space-y-6 p-6">
      <VisitsHeader date={date} onDateChange={setDate} onTabChange={setTab} tab={tab} />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Queue</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">
            {tab === 'scheduled' ? 'Scheduled visits' : 'Pending review'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Visible Rows</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">{activeQuery.data.data.length}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Current Page</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">{activeQuery.data.pagination.page}</p>
        </div>
      </section>

      <DataTable
        headers={['Visit', 'Site', 'Engineer', 'Status', 'Type', 'Scheduled', 'Completion']}
        rows={rows}
      />
      <Pagination
        hasNext={activeQuery.data.pagination.hasNextPage}
        onNext={() => setPage((current) => current + 1)}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        page={page}
      />
    </main>
  );
}

function VisitsHeader({
  tab,
  onTabChange,
  date,
  onDateChange,
}: {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  date: string;
  onDateChange: (date: string) => void;
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Visits</h1>
        <p className="text-sm text-slate-400">
          Scheduled execution queue and review backlog aligned with the blueprint Phase B operations slice.
        </p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => onTabChange('scheduled')}
            type="button"
            variant={tab === 'scheduled' ? 'primary' : 'secondary'}
          >
            Scheduled
          </Button>
          <Button
            onClick={() => onTabChange('pending-reviews')}
            type="button"
            variant={tab === 'pending-reviews' ? 'primary' : 'secondary'}
          >
            Pending Review
          </Button>
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <span>Schedule Date</span>
          <Input
            className="min-w-[180px]"
            onChange={(event) => onDateChange(event.target.value)}
            type="date"
            value={date}
          />
        </label>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/visits/new">
          New Visit
        </Link>
      </div>
    </section>
  );
}
