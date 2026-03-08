'use client';

import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Filters } from '@/components/ui/filters';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { StatusBadge } from '@/components/ui/status-badge';
import { useScheduledVisits } from '@/hooks/use-visits';

export default function VisitsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const { data, isLoading, isError, refetch } = useScheduledVisits({ page, date: date || undefined });

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = search.toLowerCase().trim();
    if (!s) return data.data;

    return data.data.filter((item) => {
      return (
        item.visitNumber.toLowerCase().includes(s) ||
        item.siteCode.toLowerCase().includes(s) ||
        item.siteName.toLowerCase().includes(s) ||
        item.engineerName.toLowerCase().includes(s)
      );
    });
  }, [data, search]);

  if (isLoading) return <LoadingState label="Loading visits..." />;
  if (isError || !data) return <ErrorState message="Failed to load scheduled visits" onRetry={() => refetch()} />;
  if (filtered.length === 0) return <EmptyState label="No visits found for current filters." />;

  const rows = filtered.map((visit) => [
    visit.visitNumber,
    visit.siteCode,
    visit.siteName,
    visit.engineerName,
    new Date(visit.scheduledDate).toLocaleString(),
    <StatusBadge key={`${visit.id}-status`} status={visit.status} />,
    visit.type,
  ]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Visits</h1>
      <Filters>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search visit/site/engineer" />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="text-xs text-slate-400">Showing scheduled visits</div>
      </Filters>
      <DataTable headers={['Visit #', 'Site Code', 'Site Name', 'Engineer', 'Scheduled', 'Status', 'Type']} rows={rows} />
      <Pagination
        page={page}
        hasNext={data.pagination.hasNextPage}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    </main>
  );
}
