'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { usePortalVisitEvidence } from '@/hooks/use-portal';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function PortalVisitEvidencePage() {
  const params = useParams<{ id: string }>();
  const visitId = params.id;
  const query = usePortalVisitEvidence(visitId);

  if (query.isLoading) {
    return <LoadingState label="Loading portal visit evidence..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load portal visit evidence." onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const photoRows = data.photos.map((photo) => [
    formatLabel(photo.type),
    formatLabel(photo.category),
    photo.itemName,
    photo.fileName,
    formatDateTime(photo.capturedAtUtc),
  ]);

  const readingRows = data.readings.map((reading) => [
    reading.readingType,
    reading.category,
    `${reading.value} ${reading.unit}`,
    reading.isWithinRange ? 'Within range' : 'Out of range',
    formatDateTime(reading.measuredAtUtc),
  ]);

  const checklistRows = data.checklistItems.map((item) => [
    item.category,
    item.itemName,
    formatLabel(item.status),
    item.isMandatory ? 'Yes' : 'No',
    formatDateTime(item.completedAtUtc),
  ]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Portal Visit Evidence</h1>
          <p className="text-sm text-slate-400">{data.visitNumber} / {data.siteCode}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={data.visitStatus} />
          <StatusBadge status={data.visitType} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/portal/visits/${data.siteCode}`}>
          Back to site visits
        </Link>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Photos</h2>
        {photoRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No photo evidence entries.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Type', 'Category', 'Item', 'File', 'Captured']} rows={photoRows} />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Readings</h2>
        {readingRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No reading evidence entries.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Type', 'Category', 'Value', 'Range', 'Measured']} rows={readingRows} />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Checklist</h2>
        {checklistRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No checklist evidence entries.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Category', 'Item', 'Status', 'Mandatory', 'Completed']} rows={checklistRows} />
          </div>
        )}
      </section>
    </main>
  );
}
