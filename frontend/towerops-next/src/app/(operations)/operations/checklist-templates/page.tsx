'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { useActivateChecklistTemplate, useChecklistTemplateHistory } from '@/hooks/use-checklist-templates';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime } from '@/lib/format';

const VISIT_TYPES = ['BM', 'CM', 'Emergency', 'Installation', 'Upgrade', 'Inspection', 'Commissioning', 'Audit'];

export default function ChecklistTemplatesPage() {
  const auth = useAuth();
  const [visitType, setVisitType] = useState('BM');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const historyQuery = useChecklistTemplateHistory(visitType);
  const activateMutation = useActivateChecklistTemplate();

  if (historyQuery.isLoading) {
    return <LoadingState label="Loading checklist templates..." />;
  }

  if (historyQuery.isError || !historyQuery.data) {
    return <ErrorState message="Failed to load checklist templates." onRetry={() => historyQuery.refetch()} />;
  }

  const isBusy = activateMutation.isPending;
  const approvedBy = auth.user?.email ?? '';
  const templates = historyQuery.data;
  const activeTemplate = templates.find((template) => template.isActive);

  const rows = templates.map((template) => [
    <Link
      className="text-brand-blue underline"
      href={`/operations/checklist-templates/${template.id}`}
      key={`${template.id}-version`}
    >
      {template.version}
    </Link>,
    formatDateTime(template.effectiveFromUtc),
    template.effectiveToUtc ? formatDateTime(template.effectiveToUtc) : 'Open',
    `${template.items.length}`,
    template.createdBy,
    <StatusBadge key={`${template.id}-status`} status={template.isActive ? 'Active' : 'Inactive'} />,
    template.isActive ? (
      'Current'
    ) : (
      <Button
        disabled={isBusy || !approvedBy}
        key={`${template.id}-activate`}
        onClick={async () => {
          try {
            await activateMutation.mutateAsync({
              id: template.id,
              payload: { approvedBy },
              visitType,
            });
            setFeedback({ tone: 'success', message: `Template ${template.version} activated.` });
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
        variant="secondary"
      >
        Activate
      </Button>
    ),
  ]);

  return (
    <main className="space-y-6 p-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Checklist Templates</h1>
          <p className="text-sm text-slate-400">Template version history and activation workflow by visit type.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Visit Type</span>
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              onChange={(event) => setVisitType(event.target.value)}
              value={visitType}
            >
              {VISIT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/operations/checklist-templates/new">
            New Template
          </Link>
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/operations/checklist-templates/history">
            History View
          </Link>
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/operations/checklist-templates/import">
            Import
          </Link>
        </div>
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

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Visit Type" value={visitType} />
        <StatCard label="Versions" value={`${templates.length}`} />
        <StatCard label="Active Version" value={activeTemplate?.version ?? 'None'} />
      </section>

      {templates.length === 0 ? (
        <EmptyState label="No templates found for this visit type." />
      ) : (
        <DataTable
          headers={['Version', 'Effective From', 'Effective To', 'Items', 'Created By', 'Status', 'Action']}
          rows={rows}
        />
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
