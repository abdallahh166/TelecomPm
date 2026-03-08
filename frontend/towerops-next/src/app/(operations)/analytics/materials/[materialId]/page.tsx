'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { useMaterialUsage } from '@/hooks/use-analytics';
import { formatDateTime, formatPercent } from '@/lib/format';

export default function MaterialAnalyticsPage() {
  const params = useParams<{ materialId: string }>();
  const materialId = params.materialId;
  const query = useMaterialUsage(materialId);

  if (query.isLoading) {
    return <LoadingState label="Loading material usage analytics..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load material analytics." onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const trendRows = data.usageTrends.map((item) => [
    formatDateTime(item.period),
    `${item.consumed} ${data.unit}`,
    `${item.purchased} ${data.unit}`,
    `${item.averagePerVisit.toFixed(2)} ${data.unit}`,
  ]);

  const siteRows = data.topUsageSites.map((item) => [
    item.siteCode,
    item.siteName,
    `${item.quantityUsed} ${data.unit}`,
    item.totalCost.toFixed(2),
    `${item.visitCount}`,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Material Usage Analytics</h1>
        <p className="text-sm text-slate-400">{data.materialCode} - {data.materialName}</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/analytics">Back to analytics</Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Stock" value={`${data.currentStock} ${data.unit}`} />
        <StatCard label="Minimum Stock" value={`${data.minimumStock} ${data.unit}`} />
        <StatCard label="Total Consumed" value={`${data.totalConsumed} ${data.unit}`} />
        <StatCard label="Total Purchased" value={`${data.totalPurchased} ${data.unit}`} />
        <StatCard label="Total Cost" value={`${data.totalCost.toFixed(2)} ${data.currency}`} />
        <StatCard label="Stock Value" value={`${data.stockValue.toFixed(2)} ${data.currency}`} />
        <StatCard label="Low Stock" value={data.isLowStock ? 'Yes' : 'No'} />
        <StatCard label="Avg Cost / Visit" value={`${data.averageCostPerVisit.toFixed(2)} ${data.currency}`} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Usage Trends</h2>
        {trendRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No usage trend data.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Period', 'Consumed', 'Purchased', 'Avg Per Visit']} rows={trendRows} />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Top Usage Sites</h2>
        {siteRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No site usage data.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Site Code', 'Site Name', 'Quantity Used', 'Cost', 'Visits']} rows={siteRows} />
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
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
