'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useApproveVisit,
  useRejectVisit,
  useRequestVisitCorrection,
  useVisit,
  useVisitEvidenceStatus,
} from '@/hooks/use-visits';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatPercent, formatLabel } from '@/lib/format';

export default function ReviewVisitDetailPage() {
  const params = useParams<{ visitId: string }>();
  const visitId = params.visitId;
  const visitQuery = useVisit(visitId);
  const evidenceQuery = useVisitEvidenceStatus(visitId);
  const approveMutation = useApproveVisit(visitId);
  const rejectMutation = useRejectVisit(visitId);
  const correctionMutation = useRequestVisitCorrection(visitId);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (visitQuery.isLoading || evidenceQuery.isLoading) {
    return <LoadingState label="Loading review detail..." />;
  }

  if (visitQuery.isError || evidenceQuery.isError || !visitQuery.data || !evidenceQuery.data) {
    return (
      <ErrorState
        message="Failed to load review detail."
        onRetry={() => {
          void visitQuery.refetch();
          void evidenceQuery.refetch();
        }}
      />
    );
  }

  const visit = visitQuery.data;
  const evidence = evidenceQuery.data;
  const isBusy = approveMutation.isPending || rejectMutation.isPending || correctionMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed.` });
      await Promise.all([visitQuery.refetch(), evidenceQuery.refetch()]);
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Review Visit {visit.visitNumber}</h1>
          <p className="text-sm text-slate-400">Reviewer decision page for approve, reject, or correction flows.</p>
        </div>
        <div className="flex gap-2">
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
        <StatCard label="Site" value={`${visit.siteName} (${visit.siteCode})`} />
        <StatCard label="Engineer" value={visit.engineerName} />
        <StatCard label="Scheduled" value={formatDateTime(visit.scheduledDate)} />
        <StatCard label="Completion" value={formatPercent(visit.completionPercentage)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Evidence Snapshot</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Photos"
              value={`${evidence.beforePhotos}/${evidence.requiredBeforePhotos} before, ${evidence.afterPhotos}/${evidence.requiredAfterPhotos} after`}
            />
            <StatCard
              label="Readings"
              value={`${evidence.readingsCount}/${evidence.requiredReadings || evidence.readingsCount}`}
            />
            <StatCard
              label="Checklist"
              value={`${evidence.completedChecklistItems}/${evidence.checklistItems}`}
            />
            <StatCard label="Score" value={formatPercent(evidence.completionPercentage)} />
          </div>

          <div className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Review History</h3>
            {visit.approvalHistory.length === 0 ? (
              <p className="text-sm text-slate-400">No previous review decisions.</p>
            ) : (
              <div className="space-y-2">
                {visit.approvalHistory.map((item) => (
                  <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3" key={item.id}>
                    <p className="text-sm text-slate-100">
                      {item.reviewerName} | {formatLabel(item.action)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.comments ?? 'No comments'} | {formatDateTime(item.reviewedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Decision Panel</h2>
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={approveNotes}
            onChange={(event) => setApproveNotes(event.target.value)}
            placeholder="Approval notes (optional)"
          />
          <Button
            type="button"
            disabled={isBusy}
            onClick={() =>
              runAction('Approve visit', () =>
                approveMutation.mutateAsync({
                  notes: approveNotes || undefined,
                }),
              )
            }
          >
            Approve Visit
          </Button>

          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Rejection reason"
          />
          <Button
            type="button"
            variant="danger"
            disabled={isBusy || !rejectionReason.trim()}
            onClick={() =>
              runAction('Reject visit', () =>
                rejectMutation.mutateAsync({
                  rejectionReason,
                }),
              )
            }
          >
            Reject Visit
          </Button>

          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={correctionNotes}
            onChange={(event) => setCorrectionNotes(event.target.value)}
            placeholder="Correction notes"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy || !correctionNotes.trim()}
            onClick={() =>
              runAction('Request correction', () =>
                correctionMutation.mutateAsync({
                  correctionNotes,
                }),
              )
            }
          >
            Request Correction
          </Button>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
