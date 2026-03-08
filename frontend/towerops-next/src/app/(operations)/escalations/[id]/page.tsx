'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useApproveEscalation,
  useCloseEscalation,
  useEscalation,
  useRejectEscalation,
  useReviewEscalation,
} from '@/hooks/use-escalations';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime } from '@/lib/format';

export default function EscalationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const escalationQuery = useEscalation(id);
  const reviewMutation = useReviewEscalation(id);
  const approveMutation = useApproveEscalation(id);
  const rejectMutation = useRejectEscalation(id);
  const closeMutation = useCloseEscalation(id);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (escalationQuery.isLoading) {
    return <LoadingState label="Loading escalation..." />;
  }

  if (escalationQuery.isError || !escalationQuery.data) {
    return <ErrorState message="Failed to load escalation." onRetry={() => escalationQuery.refetch()} />;
  }

  const escalation = escalationQuery.data;
  const isBusy =
    reviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    closeMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed.` });
      await escalationQuery.refetch();
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  const canReview = escalation.status === 'Submitted';
  const canApprove = escalation.status === 'UnderReview';
  const canReject = escalation.status === 'UnderReview';
  const canClose = escalation.status !== 'Closed';

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Escalation {escalation.incidentId}</h1>
          <p className="text-sm text-slate-400">Review and decision lifecycle for escalation workflows.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={escalation.status} />
          <StatusBadge status={escalation.level} />
          <StatusBadge status={escalation.slaClass} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/escalations">
          Back to escalations
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Escalation Id" value={escalation.id} />
        <InfoCard label="Work Order Id" value={escalation.workOrderId} />
        <InfoCard label="Site Code" value={escalation.siteCode} />
        <InfoCard label="Submitted By" value={escalation.submittedBy} />
        <InfoCard label="Submitted At" value={formatDateTime(escalation.submittedAtUtc)} />
        <InfoCard label="Financial Impact" value={`${escalation.financialImpactEgp.toFixed(2)} EGP`} />
        <InfoCard label="SLA Impact" value={`${escalation.slaImpactPercentage}%`} />
        <InfoCard label="Recommendation" value={escalation.recommendedDecision} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Evidence Package</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{escalation.evidencePackage}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Previous Actions</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{escalation.previousActions}</p>
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Button
          disabled={!canReview || isBusy}
          onClick={() => runAction('Review escalation', () => reviewMutation.mutateAsync())}
          type="button"
        >
          Mark Under Review
        </Button>
        <Button
          disabled={!canApprove || isBusy}
          onClick={() => runAction('Approve escalation', () => approveMutation.mutateAsync())}
          type="button"
          variant="secondary"
        >
          Approve
        </Button>
        <Button
          disabled={!canReject || isBusy}
          onClick={() => runAction('Reject escalation', () => rejectMutation.mutateAsync())}
          type="button"
          variant="danger"
        >
          Reject
        </Button>
        <Button
          disabled={!canClose || isBusy}
          onClick={() => runAction('Close escalation', () => closeMutation.mutateAsync())}
          type="button"
          variant="secondary"
        >
          Close
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
