'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useImportChecklistTemplate } from '@/hooks/use-checklist-templates';
import { toApiError } from '@/lib/error-adapter';

const VISIT_TYPES = ['BM', 'CM', 'Emergency', 'Installation', 'Upgrade', 'Inspection', 'Commissioning', 'Audit'];

function nowAsDateTimeLocal() {
  return new Date().toISOString().slice(0, 16);
}

export default function ImportChecklistTemplatePage() {
  const auth = useAuth();
  const importMutation = useImportChecklistTemplate();
  const [file, setFile] = useState<File | null>(null);
  const [visitType, setVisitType] = useState('BM');
  const [version, setVersion] = useState('v1.0');
  const [effectiveFromUtc, setEffectiveFromUtc] = useState(nowAsDateTimeLocal);
  const [createdBy, setCreatedBy] = useState(auth.user?.email ?? '');
  const [changeNotes, setChangeNotes] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const canSubmit = Boolean(file) && createdBy.trim().length > 0 && version.trim().length > 0 && Boolean(effectiveFromUtc);
  const importResult = importMutation.data;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Import Checklist Template</h1>
        <p className="text-sm text-slate-400">Upload an Excel file to generate checklist template items.</p>
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

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Excel File</span>
          <Input
            accept=".xlsx,.xls"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
            }}
            type="file"
          />
        </label>
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
        <label className="space-y-2 text-sm text-slate-300">
          <span>Version</span>
          <Input onChange={(event) => setVersion(event.target.value)} value={version} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Effective From</span>
          <Input
            onChange={(event) => setEffectiveFromUtc(event.target.value)}
            type="datetime-local"
            value={effectiveFromUtc}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Created By</span>
          <Input onChange={(event) => setCreatedBy(event.target.value)} value={createdBy} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Change Notes (optional)</span>
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setChangeNotes(event.target.value)}
            value={changeNotes}
          />
        </label>
      </section>

      <Button
        disabled={!canSubmit || importMutation.isPending}
        onClick={async () => {
          if (!file) {
            setFeedback({ tone: 'error', message: 'Excel file is required.' });
            return;
          }

          try {
            const result = await importMutation.mutateAsync({
              file,
              visitType,
              version: version.trim(),
              effectiveFromUtc: new Date(effectiveFromUtc).toISOString(),
              createdBy: createdBy.trim(),
              changeNotes: changeNotes.trim() || undefined,
            });
            setFeedback({
              tone: 'success',
              message: `Import completed. Imported: ${result.importedCount}, Skipped: ${result.skippedCount}.`,
            });
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Import Template
      </Button>

      {importResult ? (
        <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Import Result</h2>
          <p className="text-sm text-slate-300">Imported: {importResult.importedCount}</p>
          <p className="text-sm text-slate-300">Skipped: {importResult.skippedCount}</p>
          {importResult.errors.length > 0 ? (
            <div>
              <p className="text-sm text-slate-300">Errors:</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-rose-200">
                {importResult.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-emerald-200">No import errors reported.</p>
          )}
        </section>
      ) : null}
    </main>
  );
}
