'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useSite } from '@/hooks/use-sites';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function SiteDetailPage() {
  const params = useParams<{ siteId: string }>();
  const siteId = params.siteId;
  const siteQuery = useSite(siteId);

  if (siteQuery.isLoading) {
    return <LoadingState label="Loading site profile..." />;
  }

  if (siteQuery.isError || !siteQuery.data) {
    return <ErrorState message="Failed to load site profile." onRetry={() => siteQuery.refetch()} />;
  }

  const site = siteQuery.data;

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{site.siteCode}</h1>
          <p className="text-sm text-slate-400">Site profile with topology and maintenance context.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={site.status} />
          <StatusBadge status={site.siteType} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/sites">
          Back to sites
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard label="Name" value={site.name} />
        <InfoCard label="OMC" value={site.omcName} />
        <InfoCard label="Region" value={site.region} />
        <InfoCard label="Sub Region" value={site.subRegion} />
        <InfoCard label="Complexity" value={formatLabel(site.complexity)} />
        <InfoCard label="Ownership" value={formatLabel(site.towerOwnershipType)} />
        <InfoCard label="Responsibility" value={formatLabel(site.responsibilityScope)} />
        <InfoCard label="Last Visit" value={formatDateTime(site.lastVisitDate)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Location</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InfoCard
            label="Coordinates"
            value={
              site.coordinates
                ? `${site.coordinates.latitude}, ${site.coordinates.longitude}`
                : 'Coordinates unavailable'
            }
          />
          <InfoCard
            label="Address"
            value={
              site.address
                ? `${site.address.street || '-'}, ${site.address.city}, ${site.address.region}`
                : 'Address unavailable'
            }
          />
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href={`/sites/${site.id}/edit`}>
          Edit Site
        </Link>
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
