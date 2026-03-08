'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAsset, useAssetHistory } from '@/hooks/use-assets';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function AssetDetailPage() {
  const params = useParams<{ assetCode: string }>();
  const assetCode = params.assetCode;
  const assetQuery = useAsset(assetCode);
  const historyQuery = useAssetHistory(assetCode);

  if (assetQuery.isLoading || historyQuery.isLoading) {
    return <LoadingState label="Loading asset..." />;
  }

  if (assetQuery.isError || historyQuery.isError || !assetQuery.data || !historyQuery.data) {
    return (
      <ErrorState
        message="Failed to load asset detail."
        onRetry={() => {
          void assetQuery.refetch();
          void historyQuery.refetch();
        }}
      />
    );
  }

  const asset = assetQuery.data;
  const history = historyQuery.data.serviceHistory;
  const historyRows = history.map((entry) => [
    formatDateTime(entry.servicedAtUtc),
    formatLabel(entry.serviceType),
    entry.engineerId ?? 'Not set',
    entry.visitId ?? 'Not linked',
    entry.notes ?? 'No notes',
  ]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Asset {asset.assetCode}</h1>
          <p className="text-sm text-slate-400">Operational profile, service history, and lifecycle metadata.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={asset.status} />
          <StatusBadge status={asset.type} />
        </div>
      </div>

      <section className="flex flex-wrap gap-3 text-sm">
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href={`/assets/${asset.assetCode}/actions`}>
          Open Actions
        </Link>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href={`/assets/${asset.assetCode}/history`}>
          Open Full History
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Site" value={asset.siteCode} />
        <StatCard label="Brand / Model" value={`${asset.brand ?? 'Unknown'} / ${asset.model ?? 'Unknown'}`} />
        <StatCard label="Serial Number" value={asset.serialNumber ?? 'Not available'} />
        <StatCard label="Installed" value={formatDateTime(asset.installedAtUtc)} />
        <StatCard label="Warranty" value={formatDateTime(asset.warrantyExpiresAtUtc)} />
        <StatCard label="Last Service" value={formatDateTime(asset.lastServicedAtUtc)} />
        <StatCard label="Replaced At" value={formatDateTime(asset.replacedAtUtc)} />
        <StatCard label="Replaced By" value={asset.replacedByAssetId ?? 'Not replaced'} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Service History</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No service records found for this asset.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Serviced At', 'Type', 'Engineer', 'Visit', 'Notes']} rows={historyRows} />
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
