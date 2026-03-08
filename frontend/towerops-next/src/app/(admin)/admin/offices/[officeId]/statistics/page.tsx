'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useOffice, useOfficeStatistics } from '@/hooks/use-offices';

export default function OfficeStatisticsPage() {
  const params = useParams<{ officeId: string }>();
  const officeId = params.officeId;
  const officeQuery = useOffice(officeId);
  const statsQuery = useOfficeStatistics(officeId);

  if (officeQuery.isLoading || statsQuery.isLoading) {
    return <LoadingState label="Loading office statistics..." />;
  }

  if (officeQuery.isError || statsQuery.isError || !officeQuery.data || !statsQuery.data) {
    return <ErrorState message="Failed to load office statistics." onRetry={() => statsQuery.refetch()} />;
  }

  const office = officeQuery.data;
  const stats = statsQuery.data;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Office Statistics</h1>
        <p className="text-sm text-slate-400">
          Comprehensive operational metrics for {office.name} ({office.code}).
        </p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/admin/offices/${officeId}`}>
          Back to office profile
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Sites" value={`${stats.totalSites}`} />
        <StatCard label="Active Sites" value={`${stats.activeSites}`} />
        <StatCard label="Total Engineers" value={`${stats.totalEngineers}`} />
        <StatCard label="Active Engineers" value={`${stats.activeEngineers}`} />
        <StatCard label="Total Technicians" value={`${stats.totalTechnicians}`} />
        <StatCard label="Active Technicians" value={`${stats.activeTechnicians}`} />
        <StatCard label="Scheduled Visits" value={`${stats.scheduledVisits}`} />
        <StatCard label="Total Materials" value={`${stats.totalMaterials}`} />
        <StatCard label="Low Stock Materials" value={`${stats.lowStockMaterials}`} />
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
