'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useDownloadBdt,
  useDownloadChecklist,
  useDownloadDataCollection,
  useDownloadScorecard,
} from '@/hooks/use-reports';
import { downloadBlob } from '@/lib/download';
import { toApiError } from '@/lib/error-adapter';

function currentYearMonth() {
  const date = new Date();
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const { year, month } = currentYearMonth();
  const [visitId, setVisitId] = useState('');
  const [officeCode, setOfficeCode] = useState('');
  const [scorecardMonth, setScorecardMonth] = useState(`${month}`);
  const [scorecardYear, setScorecardYear] = useState(`${year}`);
  const [checklistVisitId, setChecklistVisitId] = useState('');
  const [checklistVisitType, setChecklistVisitType] = useState('');
  const [bdtFromDate, setBdtFromDate] = useState(dateDaysAgo(30));
  const [bdtToDate, setBdtToDate] = useState(new Date().toISOString().slice(0, 10));
  const [dataCollectionOfficeCode, setDataCollectionOfficeCode] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const scorecardMutation = useDownloadScorecard();
  const checklistMutation = useDownloadChecklist();
  const bdtMutation = useDownloadBdt();
  const dataCollectionMutation = useDownloadDataCollection();

  const isBusy =
    scorecardMutation.isPending ||
    checklistMutation.isPending ||
    bdtMutation.isPending ||
    dataCollectionMutation.isPending;

  const runDownload = async (label: string, action: () => Promise<Blob>, fileName: string) => {
    try {
      const blob = await action();
      downloadBlob(blob, fileName);
      setFeedback({ tone: 'success', message: `${label} downloaded successfully.` });
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  return (
    <main className="space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-slate-400">Generate visit, scorecard, checklist, BDT, and data collection reports.</p>
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

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Visit Report (JSON)</h2>
          <Input placeholder="Visit ID (GUID)" value={visitId} onChange={(event) => setVisitId(event.target.value)} />
          <Link
            className={`inline-block rounded-md border px-3 py-2 text-sm ${
              visitId.trim() ? 'border-slate-700 text-brand-blue' : 'border-slate-800 text-slate-500'
            }`}
            href={visitId.trim() ? `/reports/visits/${visitId.trim()}` : '#'}
          >
            Open Visit Report
          </Link>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Scorecard (Excel)</h2>
          <Input placeholder="Office Code" value={officeCode} onChange={(event) => setOfficeCode(event.target.value.toUpperCase())} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="number" min={1} max={12} value={scorecardMonth} onChange={(event) => setScorecardMonth(event.target.value)} />
            <Input type="number" min={2000} value={scorecardYear} onChange={(event) => setScorecardYear(event.target.value)} />
          </div>
          <Button
            disabled={isBusy || !officeCode.trim()}
            type="button"
            onClick={() =>
              runDownload(
                'Scorecard',
                () =>
                  scorecardMutation.mutateAsync({
                    officeCode: officeCode.trim(),
                    month: Number(scorecardMonth),
                    year: Number(scorecardYear),
                  }),
                `ContractorScorecard_${officeCode.trim()}_${scorecardYear}-${scorecardMonth}.xlsx`,
              )
            }
          >
            Download Scorecard
          </Button>
          <Link className="text-xs text-brand-blue underline" href="/reports/scorecard">
            Open dedicated scorecard page
          </Link>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Checklist (Excel)</h2>
          <Input
            placeholder="Visit ID (optional)"
            value={checklistVisitId}
            onChange={(event) => setChecklistVisitId(event.target.value)}
          />
          <Input
            placeholder="Visit Type (optional: BM, CM, ...)"
            value={checklistVisitType}
            onChange={(event) => setChecklistVisitType(event.target.value)}
          />
          <Button
            disabled={isBusy}
            type="button"
            onClick={() =>
              runDownload(
                'Checklist',
                () =>
                  checklistMutation.mutateAsync({
                    visitId: checklistVisitId.trim() || undefined,
                    visitType: checklistVisitType.trim() || undefined,
                  }),
                'GH-DE_Checklist.xlsx',
              )
            }
          >
            Download Checklist
          </Button>
          <Link className="text-xs text-brand-blue underline" href="/reports/checklist">
            Open dedicated checklist page
          </Link>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">BDT & Data Collection (Excel)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="date" value={bdtFromDate} onChange={(event) => setBdtFromDate(event.target.value)} />
            <Input type="date" value={bdtToDate} onChange={(event) => setBdtToDate(event.target.value)} />
          </div>
          <Button
            disabled={isBusy}
            type="button"
            onClick={() =>
              runDownload(
                'BDT',
                () =>
                  bdtMutation.mutateAsync({
                    fromDateUtc: bdtFromDate || undefined,
                    toDateUtc: bdtToDate || undefined,
                  }),
                'GH-BDT_BDT.xlsx',
              )
            }
          >
            Download BDT
          </Button>
          <Input
            placeholder="Office Code (optional)"
            value={dataCollectionOfficeCode}
            onChange={(event) => setDataCollectionOfficeCode(event.target.value.toUpperCase())}
          />
          <Button
            disabled={isBusy}
            type="button"
            variant="secondary"
            onClick={() =>
              runDownload(
                'Data collection',
                () =>
                  dataCollectionMutation.mutateAsync({
                    officeCode: dataCollectionOfficeCode.trim() || undefined,
                  }),
                'GH-DE_Data_Collection.xlsx',
              )
            }
          >
            Download Data Collection
          </Button>
          <div className="flex gap-3 text-xs">
            <Link className="text-brand-blue underline" href="/reports/bdt">BDT page</Link>
            <Link className="text-brand-blue underline" href="/reports/data-collection">Data collection page</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
