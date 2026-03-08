'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useAssetsBySite,
  useExpiringWarrantyAssets,
  useFaultyAssets,
} from '@/hooks/use-assets';
import { formatDateTime, formatLabel } from '@/lib/format';

type AssetTab = 'site' | 'faulty' | 'expiring';

export default function AssetsPage() {
  const [tab, setTab] = useState<AssetTab>('faulty');
  const [siteCode, setSiteCode] = useState('');
  const [days, setDays] = useState(30);

  const normalizedSiteCode = siteCode.trim();
  const siteQuery = useAssetsBySite(normalizedSiteCode || undefined, tab === 'site' && Boolean(normalizedSiteCode));
  const faultyQuery = useFaultyAssets(tab === 'faulty');
  const expiringQuery = useExpiringWarrantyAssets(days, tab === 'expiring');

  const activeQuery = tab === 'site' ? siteQuery : tab === 'faulty' ? faultyQuery : expiringQuery;
  const assets = activeQuery.data ?? [];

  if (tab === 'site' && !normalizedSiteCode) {
    return (
      <main className="space-y-6 p-6">
        <AssetsHeader
          days={days}
          onDaysChange={setDays}
          onSiteCodeChange={setSiteCode}
          onTabChange={setTab}
          siteCode={siteCode}
          tab={tab}
        />
        <EmptyState label="Enter a site code to load site assets." />
      </main>
    );
  }

  if (activeQuery.isLoading) {
    return <LoadingState label="Loading assets..." />;
  }

  if (activeQuery.isError) {
    return <ErrorState message="Failed to load assets." onRetry={() => activeQuery.refetch()} />;
  }

  if (assets.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <AssetsHeader
          days={days}
          onDaysChange={setDays}
          onSiteCodeChange={setSiteCode}
          onTabChange={setTab}
          siteCode={siteCode}
          tab={tab}
        />
        <EmptyState label="No assets matched this view." />
      </main>
    );
  }

  const rows = assets.map((asset) => [
    <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}`} key={`${asset.id}-details`}>
      {asset.assetCode}
    </Link>,
    asset.siteCode,
    formatLabel(asset.type),
    <StatusBadge key={`${asset.id}-status`} status={asset.status} />,
    formatDateTime(asset.warrantyExpiresAtUtc),
    formatDateTime(asset.lastServicedAtUtc),
    <div className="flex gap-3 text-xs" key={`${asset.id}-actions`}>
      <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}/history`}>
        History
      </Link>
      <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}/actions`}>
        Actions
      </Link>
    </div>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <AssetsHeader
        days={days}
        onDaysChange={setDays}
        onSiteCodeChange={setSiteCode}
        onTabChange={setTab}
        siteCode={siteCode}
        tab={tab}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Asset Count" value={`${assets.length}`} />
        <StatCard label="View" value={tab === 'site' ? 'Site' : tab === 'faulty' ? 'Faulty' : 'Expiring Warranty'} />
        <StatCard
          label="Faulty in Result"
          value={`${assets.filter((asset) => asset.status.toLowerCase() === 'faulty').length}`}
        />
      </section>

      <DataTable
        headers={['Asset', 'Site', 'Type', 'Status', 'Warranty', 'Last Service', 'Actions']}
        rows={rows}
      />
    </main>
  );
}

function AssetsHeader({
  tab,
  siteCode,
  days,
  onTabChange,
  onSiteCodeChange,
  onDaysChange,
}: {
  tab: AssetTab;
  siteCode: string;
  days: number;
  onTabChange: (tab: AssetTab) => void;
  onSiteCodeChange: (value: string) => void;
  onDaysChange: (value: number) => void;
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Assets</h1>
        <p className="text-sm text-slate-400">Fault, warranty, and site-scoped asset monitoring from the operations blueprint.</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onTabChange('faulty')} type="button" variant={tab === 'faulty' ? 'primary' : 'secondary'}>
            Faulty
          </Button>
          <Button onClick={() => onTabChange('expiring')} type="button" variant={tab === 'expiring' ? 'primary' : 'secondary'}>
            Expiring Warranty
          </Button>
          <Button onClick={() => onTabChange('site')} type="button" variant={tab === 'site' ? 'primary' : 'secondary'}>
            By Site
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {tab === 'site' ? (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <span>Site Code</span>
              <Input
                className="min-w-[180px]"
                onChange={(event) => onSiteCodeChange(event.target.value.toUpperCase())}
                placeholder="CAI-001"
                value={siteCode}
              />
            </label>
          ) : null}
          {tab === 'expiring' ? (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <span>Days</span>
              <Input
                className="w-24"
                min={1}
                onChange={(event) => onDaysChange(Number(event.target.value) || 30)}
                type="number"
                value={days}
              />
            </label>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
