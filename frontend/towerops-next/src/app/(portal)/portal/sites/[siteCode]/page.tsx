'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { usePortalSite } from '@/hooks/use-portal';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function PortalSiteDetailPage() {
  const params = useParams<{ siteCode: string }>();
  const siteCode = params.siteCode;
  const query = usePortalSite(siteCode);

  if (query.isLoading) {
    return <LoadingState label="Loading portal site..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load portal site." onRetry={() => query.refetch()} />;
  }

  const site = query.data;

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Portal Site {site.siteCode}</h1>
          <p className="text-sm text-slate-400">{site.name}</p>
        </div>
        <StatusBadge status={site.status} />
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/portal/sites">
          Back to portal sites
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Region" value={site.region} />
        <InfoCard label="Last Visit Date" value={formatDateTime(site.lastVisitDate)} />
        <InfoCard label="Last Visit Type" value={site.lastVisitType ? formatLabel(site.lastVisitType) : 'N/A'} />
        <InfoCard label="Open Work Orders" value={`${site.openWorkOrdersCount}`} />
        <InfoCard label="Breached SLA Count" value={`${site.breachedSlaCount}`} />
      </section>

      <section className="text-sm">
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue" href={`/portal/visits/${site.siteCode}`}>
          Open Site Visits
        </Link>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
