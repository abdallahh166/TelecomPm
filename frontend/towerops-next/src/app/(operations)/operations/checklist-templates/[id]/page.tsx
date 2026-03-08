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
import { useAuth } from '@/hooks/use-auth';
import { useActivateChecklistTemplate, useChecklistTemplate } from '@/hooks/use-checklist-templates';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime } from '@/lib/format';

export default function ChecklistTemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const templateId = params.id;
  const auth = useAuth();
  const templateQuery = useChecklistTemplate(templateId);
  const activateMutation = useActivateChecklistTemplate();
  const [approvedBy, setApprovedBy] = useState(auth.user?.email ?? '');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (templateQuery.isLoading) {
    return <LoadingState label="Loading checklist template..." />;
  }

  if (templateQuery.isError || !templateQuery.data) {
    return <ErrorState message="Failed to load checklist template." onRetry={() => templateQuery.refetch()} />;
  }

  const template = templateQuery.data;
  const rows = template.items.map((item) => [
    `${item.orderIndex}`,
    item.category,
    item.itemName,
    item.description ?? 'No description',
    item.applicableSiteTypes ?? '-',
    item.applicableVisitTypes ?? '-',
    <StatusBadge key={`${item.id}-mandatory`} status={item.isMandatory ? 'Mandatory' : 'Optional'} />,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Checklist Template {template.version}</h1>
          <p className="text-sm text-slate-400">Template detail, activation metadata, and ordered checklist items.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={template.visitType} />
          <StatusBadge status={template.isActive ? 'Active' : 'Inactive'} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/operations/checklist-templates">
          Back to checklist templates
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
        <StatCard label="Visit Type" value={template.visitType} />
        <StatCard label="Version" value={template.version} />
        <StatCard label="Effective From" value={formatDateTime(template.effectiveFromUtc)} />
        <StatCard label="Effective To" value={template.effectiveToUtc ? formatDateTime(template.effectiveToUtc) : 'Open'} />
        <StatCard label="Created By" value={template.createdBy} />
        <StatCard label="Approved By" value={template.approvedBy ?? 'Not approved'} />
        <StatCard label="Approved At" value={formatDateTime(template.approvedAtUtc)} />
        <StatCard label="Items" value={`${template.items.length}`} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Activation</h2>
        <p className="mt-2 text-sm text-slate-400">
          Activating this template supersedes the current active version for {template.visitType}.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Input
            className="min-w-[280px]"
            onChange={(event) => setApprovedBy(event.target.value)}
            placeholder="Approver email"
            value={approvedBy}
          />
          <Button
            disabled={activateMutation.isPending || !approvedBy.trim() || template.isActive}
            onClick={async () => {
              try {
                await activateMutation.mutateAsync({
                  id: template.id,
                  payload: { approvedBy: approvedBy.trim() },
                  visitType: template.visitType,
                });
                setFeedback({ tone: 'success', message: 'Template activated successfully.' });
                await templateQuery.refetch();
              } catch (error) {
                setFeedback({ tone: 'error', message: toApiError(error).message });
              }
            }}
            type="button"
          >
            Activate Template
          </Button>
          <Link className="text-brand-blue underline text-sm" href={`/operations/checklist-templates/history?visitType=${template.visitType}`}>
            View {template.visitType} history
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Items</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No items in this template.</p>
        ) : (
          <div className="mt-4">
            <DataTable
              headers={['Order', 'Category', 'Item Name', 'Description', 'Site Types', 'Visit Types', 'Mandatory']}
              rows={rows}
            />
          </div>
        )}
      </section>

      {template.changeNotes ? (
        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Change Notes</h2>
          <p className="mt-3 text-sm text-slate-300">{template.changeNotes}</p>
        </section>
      ) : null}
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
