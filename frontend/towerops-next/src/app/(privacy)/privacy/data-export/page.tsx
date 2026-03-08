'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRequestMyDataExport } from '@/hooks/use-privacy';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime } from '@/lib/format';

export default function DataExportPage() {
  const requestMutation = useRequestMyDataExport();
  const [lastRequestId, setLastRequestId] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My Data Export</h1>
        <p className="text-sm text-slate-400">Request your operational data export package.</p>
      </div>

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

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <Button
          type="button"
          disabled={requestMutation.isPending}
          onClick={async () => {
            try {
              const response = await requestMutation.mutateAsync();
              setLastRequestId(response.requestId);
              setFeedback({
                tone: 'success',
                message: `Export request submitted. Expires ${formatDateTime(response.expiresAtUtc)}.`,
              });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
        >
          Request Export
        </Button>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
        <p>Last Request ID: {lastRequestId || 'No request yet'}</p>
        <Link className="mt-3 inline-block text-brand-blue underline" href="/privacy/data-export/history">
          Open download history page
        </Link>
      </section>
    </main>
  );
}
