'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDownloadDataCollection } from '@/hooks/use-reports';
import { downloadBlob } from '@/lib/download';
import { toApiError } from '@/lib/error-adapter';

export default function DataCollectionReportPage() {
  const mutation = useDownloadDataCollection();
  const [officeCode, setOfficeCode] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Collection Report</h1>
        <p className="text-sm text-slate-400">Download data collection workbook as Excel.</p>
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
          placeholder="Office Code (optional)"
          value={officeCode}
          onChange={(event) => setOfficeCode(event.target.value.toUpperCase())}
        />
        <Button
          disabled={mutation.isPending}
          type="button"
          onClick={async () => {
            try {
              const blob = await mutation.mutateAsync({
                officeCode: officeCode.trim() || undefined,
              });
              downloadBlob(blob, 'GH-DE_Data_Collection.xlsx');
              setFeedback({ tone: 'success', message: 'Data collection report downloaded successfully.' });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
        >
          Download Data Collection
        </Button>
      </section>
    </main>
  );
}
