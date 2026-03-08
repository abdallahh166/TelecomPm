'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { useSites } from '@/hooks/use-sites';

export default function SitesPage() {
  const [page, setPage] = useState(1);
  const auth = useAuth();
  const officeId = auth.user?.officeId ?? '';
  const { data, isLoading, isError, refetch } = useSites(officeId, page);

  if (!officeId) return <ErrorState message="Your account is missing office assignment." />;
  if (isLoading) return <LoadingState label="Loading sites..." />;
  if (isError || !data) return <ErrorState message="Failed to load sites" onRetry={() => refetch()} />;
  if (data.data.length === 0) return <EmptyState label="No sites found for your office." />;

  const rows = data.data.map((site) => [
    <Link className="text-brand-blue underline" href={`/sites/${site.id}`} key={`${site.id}-code`}>
      {site.siteCode}
    </Link>,
    site.siteName,
    site.officeName,
    <StatusBadge key={`${site.id}-status`} status={site.status} />,
    site.ownershipType,
    <div className="flex gap-2" key={`${site.id}-actions`}>
      <Link className="text-brand-blue underline" href={`/sites/${site.id}`}>
        Open
      </Link>
      <Link className="text-brand-blue underline" href={`/sites/${site.id}/edit`}>
        Edit
      </Link>
    </div>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sites</h1>
          <p className="text-sm text-slate-400">Office site directory with profile and maintenance workflow access.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/sites/new">
            New Site
          </Link>
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href="/sites/import">
            Import Sites
          </Link>
        </div>
      </section>
      <DataTable headers={['Code', 'Name', 'Office', 'Status', 'Ownership', 'Actions']} rows={rows} />
      <Pagination
        page={page}
        hasNext={data.pagination.hasNextPage}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    </main>
  );
}
