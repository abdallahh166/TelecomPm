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
  useCheckInVisit,
  useCheckOutVisit,
  useCompleteVisit,
  useStartVisit,
  useSubmitVisit,
  useVisit,
  useVisitEvidenceStatus,
} from '@/hooks/use-visits';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatPercent } from '@/lib/format';

export default function EngineerVisitExecutePage() {
  const params = useParams<{ id: string }>();
  const visitId = params.id;
  const visitQuery = useVisit(visitId);
  const evidenceQuery = useVisitEvidenceStatus(visitId);
  const startMutation = useStartVisit(visitId);
  const checkInMutation = useCheckInVisit(visitId);
  const checkOutMutation = useCheckOutVisit(visitId);
  const completeMutation = useCompleteVisit(visitId);
  const submitMutation = useSubmitVisit(visitId);
  const cancelMutation = useCancelVisit(visitId);

  const [latitude, setLatitude] = useState('30.0444');
  const [longitude, setLongitude] = useState('31.2357');
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionTime, setCompletionTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (visitQuery.isLoading) return <LoadingState label="Loading visit execution context..." />;
  if (visitQuery.isError || !visitQuery.data) {
    return <ErrorState message="Failed to load visit execution context." onRetry={() => visitQuery.refetch()} />;
  }

  const visit = visitQuery.data;
  const evidence = evidenceQuery.data;
  const isBusy =
    startMutation.isPending ||
    checkInMutation.isPending ||
    checkOutMutation.isPending ||
    completeMutation.isPending ||
    submitMutation.isPending ||
    cancelMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed.` });
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  const isFinal = ['Approved', 'Rejected', 'Cancelled'].includes(visit.status);
  const canStart = visit.status === 'Scheduled';
  const canCheckIn = !isFinal;
  const canCheckOut = !isFinal;
  const canComplete = visit.status === 'InProgress';
  const canSubmit = visit.canBeSubmitted;
  const canCancel = !isFinal;

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Execute Visit {visit.visitNumber}</h1>
          <p className="text-sm text-slate-400">
            Guided lifecycle actions for the field engineer workflow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={visit.status} />
          <StatusBadge status={visit.type} />
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
        <InfoTile label="Site" value={`${visit.siteName} (${visit.siteCode})`} />
        <InfoTile label="Engineer" value={visit.engineerName} />
        <InfoTile label="Scheduled" value={formatDateTime(visit.scheduledDate)} />
        <InfoTile label="Progress" value={formatPercent(visit.completionPercentage)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Evidence Readiness</h2>
        {evidenceQuery.isLoading ? (
          <p className="mt-3 text-sm text-slate-400">Loading evidence status...</p>
        ) : evidenceQuery.isError || !evidence ? (
          <p className="mt-3 text-sm text-brand-red">Failed to load evidence status.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoTile
              label="Photos"
              value={`${evidence.beforePhotos}/${evidence.requiredBeforePhotos} before, ${evidence.afterPhotos}/${evidence.requiredAfterPhotos} after`}
            />
            <InfoTile
              label="Readings"
              value={`${evidence.readingsCount}/${evidence.requiredReadings || evidence.readingsCount}`}
            />
            <InfoTile
              label="Checklist"
              value={`${evidence.completedChecklistItems}/${evidence.checklistItems}`}
            />
            <InfoTile label="Score" value={formatPercent(evidence.completionPercentage)} />
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Geo Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="number" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
            <Input type="number" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              type="button"
              disabled={!canStart || isBusy}
              onClick={() =>
                runAction('Start visit', () =>
                  startMutation.mutateAsync({
                    latitude: Number(latitude),
                    longitude: Number(longitude),
                  }),
                )
              }
            >
              Start
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canCheckIn || isBusy}
              onClick={() =>
                runAction('Check in', () =>
                  checkInMutation.mutateAsync({
                    latitude: Number(latitude),
                    longitude: Number(longitude),
                  }),
                )
              }
            >
              Check In
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canCheckOut || isBusy}
              onClick={() =>
                runAction('Check out', () =>
                  checkOutMutation.mutateAsync({
                    latitude: Number(latitude),
                    longitude: Number(longitude),
                  }),
                )
              }
            >
              Check Out
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Completion And Submission</h2>
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={completionNotes}
            onChange={(event) => setCompletionNotes(event.target.value)}
            placeholder="Engineer notes for completion"
          />
          <Input
            type="datetime-local"
            value={completionTime}
            onChange={(event) => setCompletionTime(event.target.value)}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              disabled={!canComplete || isBusy}
              onClick={() =>
                runAction('Complete visit', () =>
                  completeMutation.mutateAsync({
                    engineerNotes: completionNotes || undefined,
                    engineerReportedCompletionTimeUtc: completionTime
                      ? new Date(completionTime).toISOString()
                      : undefined,
                  }),
                )
              }
            >
              Complete
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canSubmit || isBusy}
              onClick={() => runAction('Submit visit', () => submitMutation.mutateAsync())}
            >
              Submit
            </Button>
          </div>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Cancellation reason"
          />
          <Button
            type="button"
            variant="danger"
            disabled={!canCancel || isBusy || !cancelReason.trim()}
            onClick={() => runAction('Cancel visit', () => cancelMutation.mutateAsync({ reason: cancelReason }))}
          >
            Cancel Visit
          </Button>
        </div>
      </section>

      <div className="flex gap-4 text-sm">
        <Link className="text-brand-blue underline" href={`/engineer/visits/${visit.id}/evidence`}>
          Open Evidence Workspace
        </Link>
        <Link className="text-brand-blue underline" href={`/visits/${visit.id}`}>
          Open Full Visit Detail
        </Link>
      </div>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
