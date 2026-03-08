'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useCancelVisit,
  useCompleteVisit,
  useStartVisit,
  useSubmitVisit,
  useVisit,
  useVisitEvidenceStatus,
} from '@/hooks/use-visits';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatPercent, formatLabel } from '@/lib/format';

export default function VisitDetailPage() {
  const params = useParams<{ id: string }>();
  const visitId = params.id;
  const visitQuery = useVisit(visitId);
  const evidenceQuery = useVisitEvidenceStatus(visitId);
  const startMutation = useStartVisit(visitId);
  const completeMutation = useCompleteVisit(visitId);
  const submitMutation = useSubmitVisit(visitId);
  const cancelMutation = useCancelVisit(visitId);
  const [latitude, setLatitude] = useState('30.0444');
  const [longitude, setLongitude] = useState('31.2357');
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionTime, setCompletionTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (visitQuery.isLoading) return <LoadingState label="Loading visit..." />;
  if (visitQuery.isError || !visitQuery.data) {
    return <ErrorState message="Failed to load visit." onRetry={() => visitQuery.refetch()} />;
  }

  const visit = visitQuery.data;
  const evidence = evidenceQuery.data;
  const isBusy =
    startMutation.isPending ||
    completeMutation.isPending ||
    submitMutation.isPending ||
    cancelMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed successfully.` });
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  const handleStart = async () => {
    await runAction('Start visit', () =>
      startMutation.mutateAsync({
        latitude: Number(latitude),
        longitude: Number(longitude),
      }),
    );
  };

  const handleComplete = async () => {
    await runAction('Complete visit', () =>
      completeMutation.mutateAsync({
        engineerNotes: completionNotes || undefined,
        engineerReportedCompletionTimeUtc: completionTime
          ? new Date(completionTime).toISOString()
          : undefined,
      }),
    );
  };

  const handleSubmit = async () => {
    await runAction('Submit visit', () => submitMutation.mutateAsync());
  };

  const handleCancel = async () => {
    await runAction('Cancel visit', () =>
      cancelMutation.mutateAsync({
        reason: cancelReason,
      }),
    );
  };

  const canStart = visit.status === 'Scheduled';
  const canComplete = visit.status === 'InProgress';
  const canSubmit = visit.canBeSubmitted;
  const canCancel = !['Approved', 'Rejected', 'Cancelled'].includes(visit.status);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Visit {visit.visitNumber}</h1>
          <p className="text-sm text-slate-400">
            Execution and review detail aligned with the operations workflow in the blueprint.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={visit.status} />
          <StatusBadge status={visit.type} />
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href={`/visits/${visit.id}/edit`}>
            Edit Visit
          </Link>
        </div>
      </div>

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Site" value={`${visit.siteName} (${visit.siteCode})`} />
        <InfoCard label="Engineer" value={visit.engineerName} />
        <InfoCard label="Supervisor" value={visit.supervisorName ?? 'Not assigned'} />
        <InfoCard
          label="Technicians"
          value={visit.technicianNames.length ? visit.technicianNames.join(', ') : 'None'}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Timeline</h2>
            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <InfoDefinition label="Scheduled" value={formatDateTime(visit.scheduledDate)} />
              <InfoDefinition label="Actual Start" value={formatDateTime(visit.actualStartTime)} />
              <InfoDefinition label="Actual End" value={formatDateTime(visit.actualEndTime)} />
              <InfoDefinition
                label="Engineer Reported Completion"
                value={formatDateTime(visit.engineerReportedCompletionTimeUtc)}
              />
              <InfoDefinition label="Duration" value={visit.duration ?? 'Not available'} />
              <InfoDefinition label="Completion" value={formatPercent(visit.completionPercentage)} />
            </dl>
            {visit.engineerNotes ? (
              <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Engineer Notes</p>
                <p className="mt-2 text-sm text-slate-300">{visit.engineerNotes}</p>
              </div>
            ) : null}
            {visit.reviewerNotes ? (
              <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Reviewer Notes</p>
                <p className="mt-2 text-sm text-slate-300">{visit.reviewerNotes}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Evidence Summary</h2>
            {evidenceQuery.isLoading ? (
              <p className="mt-3 text-sm text-slate-400">Loading evidence status...</p>
            ) : evidenceQuery.isError || !evidence ? (
              <p className="mt-3 text-sm text-brand-red">Failed to load evidence status.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoDefinition
                  label="Photo Coverage"
                  value={`${evidence.beforePhotos}/${evidence.requiredBeforePhotos} before, ${evidence.afterPhotos}/${evidence.requiredAfterPhotos} after`}
                />
                <InfoDefinition
                  label="Readings"
                  value={`${evidence.readingsCount}/${evidence.requiredReadings || evidence.readingsCount}`}
                />
                <InfoDefinition
                  label="Checklist"
                  value={`${evidence.completedChecklistItems}/${evidence.checklistItems}`}
                />
                <InfoDefinition label="Completion Score" value={formatPercent(evidence.completionPercentage)} />
              </div>
            )}
          </div>

          <EvidenceTables
            approvals={visit.approvalHistory}
            checklists={visit.checklists}
            issues={visit.issuesFound}
            photos={visit.photos}
            readings={visit.readings}
          />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Lifecycle Actions</h2>
          <p className="mt-2 text-sm text-slate-400">
            Start, complete, submit, or cancel the visit using the same backend lifecycle endpoints defined in the blueprint.
          </p>

          <div className="mt-5 space-y-5">
            <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Start Visit</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input onChange={(event) => setLatitude(event.target.value)} type="number" value={latitude} />
                <Input onChange={(event) => setLongitude(event.target.value)} type="number" value={longitude} />
              </div>
              <Button disabled={!canStart || isBusy} onClick={handleStart} type="button">
                Start Visit
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Complete Visit</h3>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                onChange={(event) => setCompletionNotes(event.target.value)}
                placeholder="Engineer notes"
                value={completionNotes}
              />
              <Input
                onChange={(event) => setCompletionTime(event.target.value)}
                type="datetime-local"
                value={completionTime}
              />
              <Button disabled={!canComplete || isBusy} onClick={handleComplete} type="button">
                Complete Visit
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Submit For Review</h3>
              <p className="text-sm text-slate-400">
                Evidence must be complete before submission. Current eligibility:{' '}
                <span className="text-slate-200">{visit.canBeSubmitted ? 'Ready' : 'Blocked'}</span>
              </p>
              <Button
                disabled={!canSubmit || isBusy}
                onClick={handleSubmit}
                type="button"
                variant="secondary"
              >
                Submit Visit
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Cancel Visit</h3>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Reason for cancellation"
                value={cancelReason}
              />
              <Button
                disabled={!canCancel || isBusy || !cancelReason.trim()}
                onClick={handleCancel}
                type="button"
                variant="danger"
              >
                Cancel Visit
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-200">{value}</p>
    </div>
  );
}

function InfoDefinition({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm text-slate-200">{value}</dd>
    </div>
  );
}

function EvidenceTables({
  photos,
  readings,
  checklists,
  issues,
  approvals,
}: {
  photos: {
    id: string;
    type: string;
    category: string;
    itemName: string;
    fileStatus: string;
    capturedAt: string;
  }[];
  readings: {
    id: string;
    readingType: string;
    value: number;
    unit: string;
    isWithinRange: boolean;
    measuredAt: string;
  }[];
  checklists: {
    id: string;
    category: string;
    itemName: string;
    status: string;
    notes?: string | null;
  }[];
  issues: {
    id: string;
    title: string;
    severity: string;
    status: string;
    reportedAt: string;
  }[];
  approvals: {
    id: string;
    reviewerName: string;
    action: string;
    comments?: string | null;
    reviewedAt: string;
  }[];
}) {
  return (
    <div className="space-y-6">
      <DataListCard
        emptyLabel="No photo evidence uploaded."
        items={photos.map((photo) => ({
          id: photo.id,
          title: `${formatLabel(photo.type)} / ${formatLabel(photo.category)}`,
          subtitle: `${photo.itemName} • ${formatLabel(photo.fileStatus)} • ${formatDateTime(photo.capturedAt)}`,
        }))}
        title="Photos"
      />
      <DataListCard
        emptyLabel="No readings recorded."
        items={readings.map((reading) => ({
          id: reading.id,
          title: `${formatLabel(reading.readingType)} • ${reading.value} ${reading.unit}`,
          subtitle: `${reading.isWithinRange ? 'Within range' : 'Out of range'} • ${formatDateTime(reading.measuredAt)}`,
        }))}
        title="Readings"
      />
      <DataListCard
        emptyLabel="No checklist items available."
        items={checklists.map((checklist) => ({
          id: checklist.id,
          title: `${checklist.itemName} • ${formatLabel(checklist.status)}`,
          subtitle: `${formatLabel(checklist.category)}${checklist.notes ? ` • ${checklist.notes}` : ''}`,
        }))}
        title="Checklist"
      />
      <DataListCard
        emptyLabel="No issues reported."
        items={issues.map((issue) => ({
          id: issue.id,
          title: `${issue.title} • ${formatLabel(issue.severity)}`,
          subtitle: `${formatLabel(issue.status)} • ${formatDateTime(issue.reportedAt)}`,
        }))}
        title="Issues"
      />
      <DataListCard
        emptyLabel="No review history yet."
        items={approvals.map((approval) => ({
          id: approval.id,
          title: `${approval.reviewerName} • ${formatLabel(approval.action)}`,
          subtitle: `${approval.comments ?? 'No comments'} • ${formatDateTime(approval.reviewedAt)}`,
        }))}
        title="Approval History"
      />
    </div>
  );
}

function DataListCard({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: { id: string; title: string; subtitle: string }[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3" key={item.id}>
              <p className="text-sm text-slate-100">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
