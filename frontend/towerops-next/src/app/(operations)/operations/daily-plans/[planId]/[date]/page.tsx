'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useAssignSiteToEngineer,
  useDailyPlan,
  usePublishDailyPlan,
  useRemoveSiteFromEngineer,
  useSuggestDailyPlanOrder,
  useUnassignedSites,
} from '@/hooks/use-daily-plans';
import { toApiError } from '@/lib/error-adapter';
import { formatLabel } from '@/lib/format';
import { PlannedVisitStop, VisitType } from '@/types/daily-plans';

const VISIT_TYPES: VisitType[] = [
  'BM',
  'CM',
  'Emergency',
  'Installation',
  'Upgrade',
  'Inspection',
  'Commissioning',
  'Audit',
];

export default function DailyPlanByOfficeDatePage() {
  const params = useParams<{ planId: string; date: string }>();
  const officeId = params.planId;
  const date = params.date;
  const planQuery = useDailyPlan(officeId, date);
  const unassignedQuery = useUnassignedSites(officeId, date);
  const [assignEngineerId, setAssignEngineerId] = useState('');
  const [assignSiteCode, setAssignSiteCode] = useState('');
  const [assignVisitType, setAssignVisitType] = useState<VisitType>('CM');
  const [assignPriority, setAssignPriority] = useState('P3');
  const [removeEngineerId, setRemoveEngineerId] = useState('');
  const [removeSiteCode, setRemoveSiteCode] = useState('');
  const [suggestEngineerId, setSuggestEngineerId] = useState('');
  const [suggestedStops, setSuggestedStops] = useState<PlannedVisitStop[]>([]);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const planId = planQuery.data?.id ?? '';
  const assignMutation = useAssignSiteToEngineer(planId, officeId, date);
  const removeMutation = useRemoveSiteFromEngineer(planId, officeId, date);
  const suggestMutation = useSuggestDailyPlanOrder(planId, officeId, date);
  const publishMutation = usePublishDailyPlan(planId, officeId, date);

  if (planQuery.isLoading) {
    return <LoadingState label="Loading daily plan..." />;
  }

  if (planQuery.isError || !planQuery.data) {
    return <ErrorState message="Failed to load daily plan." onRetry={() => planQuery.refetch()} />;
  }

  const plan = planQuery.data;
  const isBusy =
    assignMutation.isPending ||
    removeMutation.isPending ||
    suggestMutation.isPending ||
    publishMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed.` });
      await Promise.all([planQuery.refetch(), unassignedQuery.refetch()]);
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  const stopRows = plan.engineerPlans.flatMap((engineerPlan) =>
    engineerPlan.stops.map((stop) => [
      engineerPlan.engineerId,
      `${stop.order}`,
      stop.siteCode,
      formatLabel(stop.visitType),
      stop.priority,
      `${stop.distanceFromPreviousKm.toFixed(2)} km`,
      `${stop.estimatedTravelMinutes} min`,
    ]),
  );

  const suggestedRows = suggestedStops.map((stop) => [
    `${stop.order}`,
    stop.siteCode,
    formatLabel(stop.visitType),
    stop.priority,
    `${stop.distanceFromPreviousKm.toFixed(2)} km`,
    `${stop.estimatedTravelMinutes} min`,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Daily Plan {officeId} / {date}</h1>
          <p className="text-sm text-slate-400">Assignment, ordering, and publish controls for this office plan.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={plan.status} />
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href={`/operations/daily-plans/${plan.id}?officeId=${officeId}&date=${date}`}>
            Plan Deep Link
          </Link>
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/operations/daily-plans">
          Back to daily plans
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

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Plan Id" value={plan.id} />
        <StatCard label="Status" value={formatLabel(plan.status)} />
        <StatCard label="Engineers" value={`${plan.engineerPlans.length}`} />
        <StatCard
          label="Total Stops"
          value={`${plan.engineerPlans.reduce((sum, item) => sum + item.stops.length, 0)}`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Assign Site</h2>
          <Input
            onChange={(event) => setAssignEngineerId(event.target.value)}
            placeholder="Engineer ID"
            value={assignEngineerId}
          />
          <Input
            onChange={(event) => setAssignSiteCode(event.target.value.toUpperCase())}
            placeholder="Site Code"
            value={assignSiteCode}
          />
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setAssignVisitType(event.target.value as VisitType)}
            value={assignVisitType}
          >
            {VISIT_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Input
            onChange={(event) => setAssignPriority(event.target.value.toUpperCase())}
            placeholder="Priority (P1/P2/P3)"
            value={assignPriority}
          />
          <Button
            disabled={isBusy || !assignEngineerId.trim() || !assignSiteCode.trim()}
            onClick={() =>
              runAction('Assign site', () =>
                assignMutation.mutateAsync({
                  engineerId: assignEngineerId.trim(),
                  siteCode: assignSiteCode.trim(),
                  visitType: assignVisitType,
                  priority: assignPriority.trim() || 'P3',
                }),
              )
            }
            type="button"
          >
            Assign Site
          </Button>
        </div>

        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Remove Assignment</h2>
          <Input
            onChange={(event) => setRemoveEngineerId(event.target.value)}
            placeholder="Engineer ID"
            value={removeEngineerId}
          />
          <Input
            onChange={(event) => setRemoveSiteCode(event.target.value.toUpperCase())}
            placeholder="Site Code"
            value={removeSiteCode}
          />
          <Button
            disabled={isBusy || !removeEngineerId.trim() || !removeSiteCode.trim()}
            onClick={() =>
              runAction('Remove assignment', () =>
                removeMutation.mutateAsync({
                  engineerId: removeEngineerId.trim(),
                  siteCode: removeSiteCode.trim(),
                }),
              )
            }
            type="button"
            variant="danger"
          >
            Remove Site
          </Button>

          <h3 className="text-sm font-semibold text-slate-200">Suggest Order</h3>
          <Input
            onChange={(event) => setSuggestEngineerId(event.target.value)}
            placeholder="Engineer ID for route suggestion"
            value={suggestEngineerId}
          />
          <Button
            disabled={isBusy || !suggestEngineerId.trim()}
            onClick={() =>
              runAction('Suggest order', async () => {
                const result = await suggestMutation.mutateAsync(suggestEngineerId.trim());
                setSuggestedStops(result);
              })
            }
            type="button"
            variant="secondary"
          >
            Suggest Route
          </Button>

          <Button
            disabled={isBusy}
            onClick={() => runAction('Publish plan', () => publishMutation.mutateAsync())}
            type="button"
            variant="secondary"
          >
            Publish Plan
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Current Plan Stops</h2>
        {stopRows.length === 0 ? (
          <p className="text-sm text-slate-400">No stops assigned yet.</p>
        ) : (
          <DataTable
            headers={['Engineer', 'Order', 'Site', 'Visit Type', 'Priority', 'Distance', 'Travel']}
            rows={stopRows}
          />
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Suggested Order Result</h2>
        {suggestedRows.length === 0 ? (
          <p className="text-sm text-slate-400">Run Suggest Route to view optimized ordering.</p>
        ) : (
          <DataTable
            headers={['Order', 'Site', 'Visit Type', 'Priority', 'Distance', 'Travel']}
            rows={suggestedRows}
          />
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Unassigned Sites</h2>
        {unassignedQuery.isLoading ? (
          <p className="text-sm text-slate-400">Loading unassigned sites...</p>
        ) : unassignedQuery.isError || !unassignedQuery.data ? (
          <p className="text-sm text-brand-red">Failed to load unassigned sites.</p>
        ) : unassignedQuery.data.length === 0 ? (
          <p className="text-sm text-slate-400">No unassigned on-air sites for this date.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {unassignedQuery.data.map((site) => (
              <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3" key={site.siteId}>
                <p className="text-sm text-slate-100">{site.siteCode}</p>
                <p className="text-xs text-slate-400">{site.name}</p>
              </div>
            ))}
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
