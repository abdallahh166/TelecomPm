'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDownloadMyDataExport } from '@/hooks/use-privacy';
import { downloadBlob } from '@/lib/download';
import { toApiError } from '@/lib/error-adapter';

export default function DataExportHistoryPage() {
  const downloadMutation = useDownloadMyDataExport();
  const [requestId, setRequestId] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Export History</h1>
        <p className="text-sm text-slate-400">Download previously requested export by request ID.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/privacy/data-export">
          Back to data export request
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
          placeholder="Request ID (GUID)"
          value={requestId}
          onChange={(event) => setRequestId(event.target.value)}
        />
        <Button
          type="button"
          disabled={downloadMutation.isPending || !requestId.trim()}
          onClick={async () => {
            try {
              const blob = await downloadMutation.mutateAsync(requestId.trim());
              downloadBlob(blob, `towerops-my-operational-data-${requestId.trim()}.json`);
              setFeedback({ tone: 'success', message: 'Data export downloaded successfully.' });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
        >
          Download Export
        </Button>
      </section>
    </main>
  );
}
