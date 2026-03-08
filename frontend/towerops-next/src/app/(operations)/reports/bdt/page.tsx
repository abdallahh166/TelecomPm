'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDownloadBdt } from '@/hooks/use-reports';
import { downloadBlob } from '@/lib/download';
import { toApiError } from '@/lib/error-adapter';

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function BdtReportPage() {
  const mutation = useDownloadBdt();
  const [fromDateUtc, setFromDateUtc] = useState(dateDaysAgo(30));
  const [toDateUtc, setToDateUtc] = useState(new Date().toISOString().slice(0, 10));
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">BDT Report</h1>
        <p className="text-sm text-slate-400">Download battery discharge test report as Excel.</p>
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
        <Input type="date" value={fromDateUtc} onChange={(event) => setFromDateUtc(event.target.value)} />
        <Input type="date" value={toDateUtc} onChange={(event) => setToDateUtc(event.target.value)} />
        <Button
          disabled={mutation.isPending}
          type="button"
          onClick={async () => {
            try {
              const blob = await mutation.mutateAsync({
                fromDateUtc: fromDateUtc || undefined,
                toDateUtc: toDateUtc || undefined,
              });
              downloadBlob(blob, 'GH-BDT_BDT.xlsx');
              setFeedback({ tone: 'success', message: 'BDT report downloaded successfully.' });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
        >
          Download BDT
        </Button>
      </section>
    </main>
  );
}
