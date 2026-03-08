'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useChecklistTemplateHistory } from '@/hooks/use-checklist-templates';
import { formatDateTime } from '@/lib/format';

const VISIT_TYPES = ['BM', 'CM', 'Emergency', 'Installation', 'Upgrade', 'Inspection', 'Commissioning', 'Audit'];

export default function ChecklistTemplateHistoryPage() {
  const searchParams = useSearchParams();
  const initialVisitType = searchParams.get('visitType') || 'BM';
  const [visitType, setVisitType] = useState(initialVisitType);
  const historyQuery = useChecklistTemplateHistory(visitType);

  if (historyQuery.isLoading) {
    return <LoadingState label="Loading template history..." />;
  }

  if (historyQuery.isError || !historyQuery.data) {
    return <ErrorState message="Failed to load template history." onRetry={() => historyQuery.refetch()} />;
  }

  const rows = historyQuery.data.map((template) => [
    <Link
      className="text-brand-blue underline"
      href={`/operations/checklist-templates/${template.id}`}
      key={`${template.id}-version`}
    >
      {template.version}
    </Link>,
    <StatusBadge key={`${template.id}-active`} status={template.isActive ? 'Active' : 'Inactive'} />,
    formatDateTime(template.effectiveFromUtc),
    template.effectiveToUtc ? formatDateTime(template.effectiveToUtc) : 'Open',
    formatDateTime(template.approvedAtUtc),
    template.approvedBy ?? 'Not approved',
    `${template.items.length}`,
  ]);

  return (
    <main className="space-y-6 p-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Checklist Template History</h1>
          <p className="text-sm text-slate-400">Historical versions by visit type, including superseded templates.</p>
        </div>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Visit Type</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
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
      </section>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/operations/checklist-templates">
          Back to checklist templates
        </Link>
      </section>

      {rows.length === 0 ? (
        <EmptyState label="No template versions found for this visit type." />
      ) : (
        <DataTable
          headers={['Version', 'Status', 'Effective From', 'Effective To', 'Approved At', 'Approved By', 'Items']}
          rows={rows}
        />
      )}
    </main>
  );
}
