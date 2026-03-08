'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { useVisitReport } from '@/hooks/use-reports';
import { formatDateTime, formatPercent } from '@/lib/format';

export default function VisitReportPage() {
  const params = useParams<{ visitId: string }>();
  const visitId = params.visitId;
  const query = useVisitReport(visitId);

  if (query.isLoading) {
    return <LoadingState label="Loading visit report..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load visit report." onRetry={() => query.refetch()} />;
  }

  const report = query.data;
  const photoRows = report.photoComparisons.map((item) => [
    item.itemName,
    item.beforePhotoUrl,
    item.afterPhotoUrl,
    item.beforeDescription ?? '',
    item.afterDescription ?? '',
  ]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Visit Report</h1>
        <p className="text-sm text-slate-400">Visit {report.visit.visitNumber ?? visitId}</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/reports">
          Back to reports
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Visit Number" value={String(report.visit.visitNumber ?? 'N/A')} />
        <InfoCard label="Visit Status" value={String(report.visit.status ?? 'N/A')} />
        <InfoCard label="Visit Type" value={String(report.visit.type ?? 'N/A')} />
        <InfoCard label="Scheduled" value={formatDateTime(report.visit.scheduledDate as string | undefined)} />
        <InfoCard label="Site Code" value={String(report.site.siteCode ?? 'N/A')} />
        <InfoCard label="Site Name" value={String(report.site.siteName ?? 'N/A')} />
        <InfoCard label="Site Status" value={String(report.site.status ?? 'N/A')} />
        <InfoCard label="Total Material Cost" value={report.totalMaterialCost.toFixed(2)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Photo Comparisons</h2>
        {photoRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No before/after comparison entries.</p>
        ) : (
          <div className="mt-4">
            <DataTable
              headers={['Item', 'Before URL', 'After URL', 'Before Notes', 'After Notes']}
              rows={photoRows}
            />
          </div>
        )}
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
