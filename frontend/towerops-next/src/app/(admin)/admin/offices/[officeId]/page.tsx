'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDeleteOffice, useOffice, useOfficeStatistics } from '@/hooks/use-offices';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime } from '@/lib/format';

export default function OfficeDetailPage() {
  const params = useParams<{ officeId: string }>();
  const router = useRouter();
  const officeId = params.officeId;
  const officeQuery = useOffice(officeId);
  const statsQuery = useOfficeStatistics(officeId);
  const deleteMutation = useDeleteOffice();
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (officeQuery.isLoading) {
    return <LoadingState label="Loading office..." />;
  }

  if (officeQuery.isError || !officeQuery.data) {
    return <ErrorState message="Failed to load office." onRetry={() => officeQuery.refetch()} />;
  }

  const office = officeQuery.data;
  const stats = statsQuery.data;

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{office.name}</h1>
          <p className="text-sm text-slate-400">Office profile, contact ownership, and statistics summary.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={office.isActive ? 'Active' : 'Inactive'} />
          <StatusBadge status={office.code} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/admin/offices">
          Back to offices
        </Link>
      </section>

      {feedback ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard label="Code" value={office.code} />
        <InfoCard label="Region" value={office.region} />
        <InfoCard label="City" value={office.city} />
        <InfoCard label="Street" value={office.street || 'Not specified'} />
        <InfoCard label="Contact Person" value={office.contactPerson || 'Not specified'} />
        <InfoCard label="Contact Phone" value={office.contactPhone || 'Not specified'} />
        <InfoCard label="Contact Email" value={office.contactEmail || 'Not specified'} />
        <InfoCard label="Created At" value={formatDateTime(office.createdAt)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Statistics Snapshot</h2>
        {statsQuery.isLoading ? (
          <p className="mt-3 text-sm text-slate-400">Loading statistics...</p>
        ) : statsQuery.isError || !stats ? (
          <p className="mt-3 text-sm text-rose-200">Failed to load office statistics.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <InfoCard label="Total Sites" value={`${stats.totalSites}`} />
            <InfoCard label="Active Sites" value={`${stats.activeSites}`} />
            <InfoCard label="Total Engineers" value={`${stats.totalEngineers}`} />
            <InfoCard label="Active Engineers" value={`${stats.activeEngineers}`} />
            <InfoCard label="Scheduled Visits" value={`${stats.scheduledVisits}`} />
            <InfoCard label="Low Stock Materials" value={`${stats.lowStockMaterials}`} />
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href={`/admin/offices/${office.id}/edit`}>
          Edit Office
        </Link>
        <Link
          className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue"
          href={`/admin/offices/${office.id}/statistics`}
        >
          Full Statistics
        </Link>
        <Button
          disabled={deleteMutation.isPending}
          onClick={async () => {
            try {
              await deleteMutation.mutateAsync(office.id);
              router.push('/admin/offices');
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
          variant="danger"
        >
          Delete Office
        </Button>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm text-slate-100">{value}</p>
    </div>
  );
}
