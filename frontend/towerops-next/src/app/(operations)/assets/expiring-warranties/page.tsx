'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { useExpiringWarrantyAssets } from '@/hooks/use-assets';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function ExpiringWarrantiesPage() {
  const [days, setDays] = useState(30);
  const query = useExpiringWarrantyAssets(days);

  if (query.isLoading) {
    return <LoadingState label="Loading assets with expiring warranties..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load expiring warranties." onRetry={() => query.refetch()} />;
  }

  if (query.data.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <Header days={days} onDaysChange={setDays} />
        <EmptyState label="No assets have warranties expiring in this window." />
      </main>
    );
  }

  const rows = query.data.map((asset) => [
    <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}`} key={`${asset.id}-code`}>
      {asset.assetCode}
    </Link>,
    asset.siteCode,
    formatLabel(asset.type),
    <StatusBadge key={`${asset.id}-status`} status={asset.status} />,
    formatDateTime(asset.warrantyExpiresAtUtc),
    <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}/actions`} key={`${asset.id}-action`}>
      Actions
    </Link>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <Header days={days} onDaysChange={setDays} />
      <DataTable headers={['Asset', 'Site', 'Type', 'Status', 'Warranty Expires', 'Actions']} rows={rows} />
    </main>
  );
}

function Header({ days, onDaysChange }: { days: number; onDaysChange: (days: number) => void }) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Expiring Warranties</h1>
          <p className="text-sm text-slate-400">Assets that require proactive service before warranty expiration.</p>
        </div>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Days Window</span>
          <Input
            className="w-24"
            min={1}
            onChange={(event) => onDaysChange(Number(event.target.value) || 30)}
            type="number"
            value={days}
          />
        </label>
      </div>
      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/assets">
          Back to assets
        </Link>
      </section>
    </>
  );
}
