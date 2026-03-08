'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAssetHistory } from '@/hooks/use-assets';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function AssetHistoryPage() {
  const params = useParams<{ assetCode: string }>();
  const assetCode = params.assetCode;
  const historyQuery = useAssetHistory(assetCode);

  if (historyQuery.isLoading) {
    return <LoadingState label="Loading asset history..." />;
  }

  if (historyQuery.isError || !historyQuery.data) {
    return <ErrorState message="Failed to load asset history." onRetry={() => historyQuery.refetch()} />;
  }

  const asset = historyQuery.data;
  const rows = asset.serviceHistory.map((entry) => [
    formatDateTime(entry.servicedAtUtc),
    formatLabel(entry.serviceType),
    entry.engineerId ?? 'Not set',
    entry.visitId ?? 'Not linked',
    entry.notes ?? 'No notes',
  ]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Asset History {asset.assetCode}</h1>
          <p className="text-sm text-slate-400">Complete service timeline for this asset.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={asset.status} />
          <StatusBadge status={asset.type} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}`}>
          Back to asset detail
        </Link>
      </section>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
          No history records were found.
        </div>
      ) : (
        <DataTable headers={['Serviced At', 'Service Type', 'Engineer', 'Visit', 'Notes']} rows={rows} />
      )}
    </main>
  );
}
