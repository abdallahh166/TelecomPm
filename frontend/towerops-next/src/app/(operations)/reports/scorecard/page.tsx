'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDownloadScorecard } from '@/hooks/use-reports';
import { downloadBlob } from '@/lib/download';
import { toApiError } from '@/lib/error-adapter';

function currentYearMonth() {
  const date = new Date();
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export default function ScorecardReportPage() {
  const { year, month } = currentYearMonth();
  const mutation = useDownloadScorecard();
  const [officeCode, setOfficeCode] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(`${month}`);
  const [selectedYear, setSelectedYear] = useState(`${year}`);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Scorecard Report</h1>
        <p className="text-sm text-slate-400">Download monthly contractor scorecard as Excel.</p>
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
          placeholder="Office Code"
          value={officeCode}
          onChange={(event) => setOfficeCode(event.target.value.toUpperCase())}
        />
        <Input
          type="number"
          min={1}
          max={12}
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        />
        <Input
          type="number"
          min={2000}
          value={selectedYear}
          onChange={(event) => setSelectedYear(event.target.value)}
        />
        <Button
          disabled={mutation.isPending || !officeCode.trim()}
          type="button"
          onClick={async () => {
            try {
              const blob = await mutation.mutateAsync({
                officeCode: officeCode.trim(),
                month: Number(selectedMonth),
                year: Number(selectedYear),
              });
              downloadBlob(blob, `ContractorScorecard_${officeCode.trim()}_${selectedYear}-${selectedMonth}.xlsx`);
              setFeedback({ tone: 'success', message: 'Scorecard downloaded successfully.' });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
        >
          Download Scorecard
        </Button>
      </section>
    </main>
  );
}
