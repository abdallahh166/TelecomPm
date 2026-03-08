'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useAuth } from '@/hooks/use-auth';
import { useSites } from '@/hooks/use-sites';

export default function SitesPage() {
  const [page, setPage] = useState(1);
  const auth = useAuth();
  const officeId = auth.user?.officeId ?? '';
  const { data, isLoading, isError, refetch } = useSites(officeId, page);

  if (isLoading) return <LoadingState label="Loading sites..." />;
  if (isError || !data) return <ErrorState message="Failed to load sites" onRetry={() => refetch()} />;
  if (data.data.length === 0) return <EmptyState label="No sites found for your office." />;

  const rows = data.data.map((site) => [
    site.siteCode,
    site.siteName,
    site.officeName,
    <StatusBadge key={`${site.id}-status`} status={site.status} />,
    site.ownershipType,
  ]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sites</h1>
      <DataTable headers={['Code', 'Name', 'Office', 'Status', 'Ownership']} rows={rows} />
      <Pagination
        page={page}
        hasNext={data.pagination.hasNextPage}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    </main>
  );
}
