'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { useCreateDailyPlan, useDailyPlan } from '@/hooks/use-daily-plans';
import { toApiError } from '@/lib/error-adapter';
import { formatLabel } from '@/lib/format';

function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyPlansPage() {
  const auth = useAuth();
  const officeId = auth.user?.officeId;
  const officeManagerId = auth.user?.id;
  const [date, setDate] = useState(todayDateInput);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const planQuery = useDailyPlan(officeId, date, Boolean(officeId));
  const createMutation = useCreateDailyPlan();

  if (!officeId || !officeManagerId) {
    return <ErrorState message="Your account is missing office assignment or user identity." />;
  }

  const planNotFound =
    planQuery.isError &&
    toApiError(planQuery.error).code === 'resource.not_found';

  if (planQuery.isLoading) {
    return <LoadingState label="Loading daily plan..." />;
  }

  if (planQuery.isError && !planNotFound) {
    return <ErrorState message="Failed to load daily plan." onRetry={() => planQuery.refetch()} />;
  }

  const plan = planQuery.data;
  const engineerRows =
    plan?.engineerPlans.map((item) => [
      item.engineerId,
      `${item.stops.length}`,
      `${item.totalEstimatedDistanceKm.toFixed(2)} km`,
      `${item.totalEstimatedTravelMinutes} min`,
    ]) ?? [];

  return (
    <main className="space-y-6 p-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Daily Plans</h1>
          <p className="text-sm text-slate-400">Office planning board for assignment, routing, and publish workflow.</p>
        </div>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Plan Date</span>
          <Input
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </label>
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

      {planNotFound || !plan ? (
        <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <EmptyState label="No daily plan exists for this office and date." />
          <Button
            disabled={createMutation.isPending}
            onClick={async () => {
              try {
                await createMutation.mutateAsync({
                  officeId,
                  planDate: date,
                  officeManagerId,
                });
                setFeedback({ tone: 'success', message: 'Daily plan created successfully.' });
                await planQuery.refetch();
              } catch (error) {
                setFeedback({ tone: 'error', message: toApiError(error).message });
              }
            }}
            type="button"
          >
            Create Daily Plan
          </Button>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="Plan Id" value={plan.id} />
            <StatCard label="Status" value={formatLabel(plan.status)} />
            <StatCard label="Engineers" value={`${plan.engineerPlans.length}`} />
            <StatCard
              label="Total Stops"
              value={`${plan.engineerPlans.reduce((sum, item) => sum + item.stops.length, 0)}`}
            />
          </section>

          <section className="flex flex-wrap gap-3 text-sm">
            <Link
              className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue"
              href={`/operations/daily-plans/${officeId}/${date}`}
            >
              Open Office-Date Plan
            </Link>
            <Link
              className="rounded-md border border-slate-700 px-3 py-2 text-brand-blue"
              href={`/operations/daily-plans/${plan.id}?officeId=${officeId}&date=${date}`}
            >
              Open Plan Deep Link
            </Link>
            <StatusBadge status={plan.status} />
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Engineer Summary</h2>
            {engineerRows.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No engineer assignments yet.</p>
            ) : (
              <div className="mt-4">
                <DataTable
                  headers={['Engineer', 'Stops', 'Distance', 'Travel Time']}
                  rows={engineerRows}
                />
              </div>
            )}
          </section>
        </>
      )}
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
