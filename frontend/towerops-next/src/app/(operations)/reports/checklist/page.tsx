'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDownloadChecklist } from '@/hooks/use-reports';
import { downloadBlob } from '@/lib/download';
import { toApiError } from '@/lib/error-adapter';

export default function ChecklistReportPage() {
  const mutation = useDownloadChecklist();
  const [visitId, setVisitId] = useState('');
  const [visitType, setVisitType] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Checklist Report</h1>
        <p className="text-sm text-slate-400">Download checklist report as Excel.</p>
      </div>
      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/reports">
          Back to reports
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

      <section className="grid max-w-xl gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <Input
          placeholder="Visit ID (optional)"
          value={visitId}
          onChange={(event) => setVisitId(event.target.value)}
        />
        <Input
          placeholder="Visit Type (optional: BM, CM...)"
          value={visitType}
          onChange={(event) => setVisitType(event.target.value)}
        />
        <Button
          disabled={mutation.isPending}
          type="button"
          onClick={async () => {
            try {
              const blob = await mutation.mutateAsync({
                visitId: visitId.trim() || undefined,
                visitType: visitType.trim() || undefined,
              });
              downloadBlob(blob, 'GH-DE_Checklist.xlsx');
              setFeedback({ tone: 'success', message: 'Checklist report downloaded successfully.' });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
        >
          Download Checklist
        </Button>
      </section>
    </main>
  );
}
