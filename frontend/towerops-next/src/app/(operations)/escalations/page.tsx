'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { useEscalation } from '@/hooks/use-escalations';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function EscalationsPage() {
  const [escalationId, setEscalationId] = useState('');
  const normalizedId = escalationId.trim();
  const escalationQuery = useEscalation(normalizedId, Boolean(normalizedId));

  if (!normalizedId) {
    return (
      <main className="space-y-6 p-6">
        <Header escalationId={escalationId} onEscalationIdChange={setEscalationId} />
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
          Enter an escalation ID to fetch details, or create a new escalation request.
        </div>
      </main>
    );
  }

  if (escalationQuery.isLoading) {
    return <LoadingState label="Loading escalation..." />;
  }

  if (escalationQuery.isError || !escalationQuery.data) {
    return (
      <main className="space-y-6 p-6">
        <Header escalationId={escalationId} onEscalationIdChange={setEscalationId} />
        <ErrorState message="Failed to load escalation." onRetry={() => escalationQuery.refetch()} />
      </main>
    );
  }

  const escalation = escalationQuery.data;

  return (
    <main className="space-y-6 p-6">
      <Header escalationId={escalationId} onEscalationIdChange={setEscalationId} />

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Escalation {escalation.incidentId}</h2>
            <p className="text-sm text-slate-400">
              Site {escalation.siteCode} | submitted {formatDateTime(escalation.submittedAtUtc)}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={escalation.status} />
            <StatusBadge status={escalation.level} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Info label="Work Order" value={escalation.workOrderId} />
          <Info label="SLA Class" value={escalation.slaClass} />
          <Info label="Impact %" value={`${escalation.slaImpactPercentage}%`} />
          <Info label="Financial Impact" value={`${escalation.financialImpactEgp.toFixed(2)} EGP`} />
          <Info label="Submitted By" value={escalation.submittedBy} />
          <Info label="Recommendation" value={formatLabel(escalation.recommendedDecision)} />
        </div>
      </section>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/escalations/${escalation.id}`}>
          Open escalation details and actions
        </Link>
      </section>
    </main>
  );
}

function Header({
  escalationId,
  onEscalationIdChange,
}: {
  escalationId: string;
  onEscalationIdChange: (value: string) => void;
}) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">Escalations</h1>
        <p className="text-sm text-slate-400">Lookup and process escalation requests across SLA-impact incidents.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="min-w-[320px]"
          onChange={(event) => onEscalationIdChange(event.target.value)}
          placeholder="Escalation ID"
          value={escalationId}
        />
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/escalations/new">
          New Escalation
        </Link>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm text-slate-100">{value}</p>
    </div>
  );
}
