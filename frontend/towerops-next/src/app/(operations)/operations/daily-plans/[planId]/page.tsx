'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDailyPlan } from '@/hooks/use-daily-plans';
import { formatLabel } from '@/lib/format';

export default function DailyPlanByIdPage() {
  const params = useParams<{ planId: string }>();
  const searchParams = useSearchParams();
  const planId = params.planId;
  const officeId = searchParams.get('officeId') ?? '';
  const date = searchParams.get('date') ?? '';
  const planQuery = useDailyPlan(officeId || undefined, date || undefined, Boolean(officeId && date));

  if (!officeId || !date) {
    return (
      <main className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Daily Plan {planId}</h1>
        <p className="text-sm text-slate-400">
          This route requires `officeId` and `date` query parameters to load plan data.
        </p>
        <Link className="text-brand-blue underline" href="/operations/daily-plans">
          Open daily plans index
        </Link>
      </main>
    );
  }

  if (planQuery.isLoading) {
    return <LoadingState label="Loading plan..." />;
  }

  if (planQuery.isError || !planQuery.data) {
    return <ErrorState message="Failed to load plan by office/date context." onRetry={() => planQuery.refetch()} />;
  }

  const plan = planQuery.data;
  const rows = plan.engineerPlans.map((item) => [
    item.engineerId,
    `${item.stops.length}`,
    `${item.totalEstimatedDistanceKm.toFixed(2)} km`,
    `${item.totalEstimatedTravelMinutes} min`,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Daily Plan {planId}</h1>
          <p className="text-sm text-slate-400">Deep-link view for plan context and engineer summary.</p>
        </div>
        <StatusBadge status={plan.status} />
      </div>

      {plan.id !== planId ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Requested plan id does not match the office/date result. Loaded plan: {plan.id}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Office" value={officeId} />
        <StatCard label="Plan Date" value={date} />
        <StatCard label="Status" value={formatLabel(plan.status)} />
      </section>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/operations/daily-plans/${officeId}/${date}`}>
          Open full plan actions page
        </Link>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Engineer Summary</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No engineer assignments in this plan.</p>
        ) : (
          <div className="mt-4">
            <DataTable headers={['Engineer', 'Stops', 'Distance', 'Travel']} rows={rows} />
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm text-slate-100">{value}</p>
    </div>
  );
}
