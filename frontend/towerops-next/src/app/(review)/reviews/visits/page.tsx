'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import {
  useApproveVisit,
  usePendingReviewVisits,
  useRejectVisit,
  useRequestVisitCorrection,
  useVisit,
} from '@/hooks/use-visits';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatPercent, formatLabel } from '@/lib/format';

export default function ReviewVisitsPage() {
  const auth = useAuth();
  const [page, setPage] = useState(1);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const queueQuery = usePendingReviewVisits(auth.user?.officeId, page);
  const selectedVisitQuery = useVisit(selectedVisitId ?? '');
  const approveMutation = useApproveVisit(selectedVisitId ?? '');
  const rejectMutation = useRejectVisit(selectedVisitId ?? '');
  const correctionMutation = useRequestVisitCorrection(selectedVisitId ?? '');

  useEffect(() => {
    if (!queueQuery.data?.data.length) {
      setSelectedVisitId(null);
      return;
    }

    if (!selectedVisitId || !queueQuery.data.data.some((item) => item.id === selectedVisitId)) {
      setSelectedVisitId(queueQuery.data.data[0].id);
    }
  }, [queueQuery.data?.data, selectedVisitId]);

  if (queueQuery.isLoading) return <LoadingState label="Loading review queue..." />;
  if (queueQuery.isError || !queueQuery.data) {
    return <ErrorState message="Failed to load review queue." onRetry={() => queueQuery.refetch()} />;
  }
  if (queueQuery.data.data.length === 0) {
    return (
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Visit Reviews</h1>
        <EmptyState label="No visits are currently waiting for review." />
      </main>
    );
  }

  const isBusy = approveMutation.isPending || rejectMutation.isPending || correctionMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed.` });
      await queueQuery.refetch();
      if (selectedVisitQuery.refetch) {
        await selectedVisitQuery.refetch();
      }
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  const rows = queueQuery.data.data.map((visit) => [
    <div className="flex items-center gap-2" key={`${visit.id}-select`}>
      <button
        className={`underline ${selectedVisitId === visit.id ? 'text-slate-100' : 'text-brand-blue'}`}
        onClick={() => setSelectedVisitId(visit.id)}
        type="button"
      >
        {visit.visitNumber}
      </button>
      <Link className="text-xs text-brand-blue underline" href={`/reviews/visits/${visit.id}`}>
        Open
      </Link>
    </div>,
    `${visit.siteName} (${visit.siteCode})`,
    visit.engineerName,
    <StatusBadge key={`${visit.id}-status`} status={visit.status} />,
    formatDateTime(visit.scheduledDate),
    formatPercent(visit.completionPercentage),
  ]);

  const selectedVisit = selectedVisitQuery.data;

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Visit Reviews</h1>
        <p className="text-sm text-slate-400">
          QA queue for approve, reject, and request-correction decisions.
        </p>
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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <DataTable
            headers={['Visit', 'Site', 'Engineer', 'Status', 'Scheduled', 'Completion']}
            rows={rows}
          />
          <Pagination
            page={page}
            hasNext={queueQuery.data.pagination.hasNextPage}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Review Decision</h2>
          {selectedVisitQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading selected visit...</p>
          ) : selectedVisitQuery.isError || !selectedVisit ? (
            <p className="text-sm text-brand-red">Failed to load selected visit details.</p>
          ) : (
            <>
              <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-sm text-slate-100">
                  {selectedVisit.visitNumber} | {selectedVisit.siteName} ({selectedVisit.siteCode})
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Engineer: {selectedVisit.engineerName} | Type: {formatLabel(selectedVisit.type)} | Scheduled:{' '}
                  {formatDateTime(selectedVisit.scheduledDate)}
                </p>
              </div>

              <textarea
                className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={approveNotes}
                onChange={(event) => setApproveNotes(event.target.value)}
                placeholder="Approval notes (optional)"
              />
              <Button
                type="button"
                disabled={isBusy || !selectedVisitId}
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
                disabled={isBusy || !selectedVisitId || !rejectionReason.trim()}
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
                placeholder="Correction request notes"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={isBusy || !selectedVisitId || !correctionNotes.trim()}
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
            </>
          )}
        </div>
      </section>
    </main>
  );
}
