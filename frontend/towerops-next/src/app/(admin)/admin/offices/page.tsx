'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useOffices } from '@/hooks/use-offices';

export default function AdminOfficesPage() {
  const [page, setPage] = useState(1);
  const [onlyActive, setOnlyActive] = useState(true);
  const officesQuery = useOffices(page, { onlyActive, pageSize: 10 }, true);

  if (officesQuery.isLoading) {
    return <LoadingState label="Loading offices..." />;
  }

  if (officesQuery.isError || !officesQuery.data) {
    return <ErrorState message="Failed to load offices." onRetry={() => officesQuery.refetch()} />;
  }

  if (officesQuery.data.data.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <Header onlyActive={onlyActive} onOnlyActiveChange={setOnlyActive} />
        <EmptyState label="No offices found with the current filter." />
      </main>
    );
  }

  const rows = officesQuery.data.data.map((office) => [
    <Link className="text-brand-blue underline" href={`/admin/offices/${office.id}`} key={`${office.id}-code`}>
      {office.code}
    </Link>,
    office.name,
    office.region,
    office.city,
    `${office.totalSites}`,
    `${office.activeEngineers}`,
    <StatusBadge key={`${office.id}-active`} status={office.isActive ? 'Active' : 'Inactive'} />,
    <div className="flex gap-2" key={`${office.id}-actions`}>
      <Link className="text-brand-blue underline" href={`/admin/offices/${office.id}/edit`}>
        Edit
      </Link>
      <Link className="text-brand-blue underline" href={`/admin/offices/${office.id}/statistics`}>
        Statistics
      </Link>
    </div>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <Header onlyActive={onlyActive} onOnlyActiveChange={setOnlyActive} />
      <DataTable
        headers={['Code', 'Name', 'Region', 'City', 'Sites', 'Active Engineers', 'Status', 'Actions']}
        rows={rows}
      />
      <Pagination
        hasNext={officesQuery.data.pagination.hasNextPage}
        onNext={() => setPage((current) => current + 1)}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        page={page}
      />
    </main>
  );
}

function Header({
  onlyActive,
  onOnlyActiveChange,
}: {
  onlyActive: boolean;
  onOnlyActiveChange: (value: boolean) => void;
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Admin Offices</h1>
        <p className="text-sm text-slate-400">Office governance, contact ownership, and operational visibility.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            checked={onlyActive}
            className="h-4 w-4"
            onChange={(event) => onOnlyActiveChange(event.target.checked)}
            type="checkbox"
          />
          Only Active
        </label>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/admin/offices/new">
          New Office
        </Link>
      </div>
    </section>
  );
}
