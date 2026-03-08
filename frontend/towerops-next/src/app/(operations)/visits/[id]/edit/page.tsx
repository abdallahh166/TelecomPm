'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { useCancelVisit, useRescheduleVisit, useVisit } from '@/hooks/use-visits';
import { toApiError } from '@/lib/error-adapter';

function nowAsDateTimeLocal() {
  return new Date().toISOString().slice(0, 16);
}

export default function EditVisitPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const visitId = params.id;
  const visitQuery = useVisit(visitId);
  const rescheduleMutation = useRescheduleVisit(visitId);
  const cancelMutation = useCancelVisit(visitId);
  const [newScheduledDate, setNewScheduledDate] = useState(nowAsDateTimeLocal);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (visitQuery.isLoading) {
    return <LoadingState label="Loading visit..." />;
  }

  if (visitQuery.isError || !visitQuery.data) {
    return <ErrorState message="Failed to load visit." onRetry={() => visitQuery.refetch()} />;
  }

  const visit = visitQuery.data;
  const isBusy = rescheduleMutation.isPending || cancelMutation.isPending;
  const canCancel = !['Approved', 'Rejected', 'Cancelled'].includes(visit.status);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Visit {visit.visitNumber}</h1>
          <p className="text-sm text-slate-400">Reschedule or cancel this visit according to operations workflow.</p>
        </div>
        <StatusBadge status={visit.status} />
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/visits/${visitId}`}>
          Back to visit details
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

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Reschedule Visit</h2>
          <Input
            onChange={(event) => setNewScheduledDate(event.target.value)}
            type="datetime-local"
            value={newScheduledDate}
          />
          <textarea
            className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setRescheduleReason(event.target.value)}
            placeholder="Reschedule reason (optional)"
            value={rescheduleReason}
          />
          <Button
            disabled={isBusy || !newScheduledDate}
            onClick={async () => {
              try {
                await rescheduleMutation.mutateAsync({
                  newScheduledDate: new Date(newScheduledDate).toISOString(),
                  reason: rescheduleReason.trim() || undefined,
                });
                setFeedback({ tone: 'success', message: 'Visit rescheduled successfully.' });
                router.push(`/visits/${visitId}`);
              } catch (error) {
                setFeedback({ tone: 'error', message: toApiError(error).message });
              }
            }}
            type="button"
          >
            Reschedule Visit
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Cancel Visit</h2>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Cancellation reason"
            value={cancelReason}
          />
          <Button
            disabled={isBusy || !canCancel || !cancelReason.trim()}
            onClick={async () => {
              try {
                await cancelMutation.mutateAsync({ reason: cancelReason.trim() });
                setFeedback({ tone: 'success', message: 'Visit cancelled successfully.' });
                router.push(`/visits/${visitId}`);
              } catch (error) {
                setFeedback({ tone: 'error', message: toApiError(error).message });
              }
            }}
            type="button"
            variant="danger"
          >
            Cancel Visit
          </Button>
        </div>
      </section>
    </main>
  );
}
