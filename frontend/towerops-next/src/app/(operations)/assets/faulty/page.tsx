'use client';

import Link from 'next/link';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useFaultyAssets } from '@/hooks/use-assets';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function FaultyAssetsPage() {
  const faultyQuery = useFaultyAssets();

  if (faultyQuery.isLoading) {
    return <LoadingState label="Loading faulty assets..." />;
  }

  if (faultyQuery.isError || !faultyQuery.data) {
    return <ErrorState message="Failed to load faulty assets." onRetry={() => faultyQuery.refetch()} />;
  }

  if (faultyQuery.data.length === 0) {
    return <EmptyState label="No faulty assets found." />;
  }

  const rows = faultyQuery.data.map((asset) => [
    <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}`} key={`${asset.id}-code`}>
      {asset.assetCode}
    </Link>,
    asset.siteCode,
    formatLabel(asset.type),
    <StatusBadge key={`${asset.id}-status`} status={asset.status} />,
    formatDateTime(asset.lastServicedAtUtc),
    <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}/actions`} key={`${asset.id}-action`}>
      Resolve
    </Link>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Faulty Assets</h1>
        <p className="text-sm text-slate-400">Focused view of assets currently in faulty state.</p>
      </div>
      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/assets">
          Back to assets
        </Link>
      </section>
      <DataTable headers={['Asset', 'Site', 'Type', 'Status', 'Last Service', 'Actions']} rows={rows} />
    </main>
  );
}
