'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useImportSiteData } from '@/hooks/use-sites';
import { toApiError } from '@/lib/error-adapter';
import { SiteImportKind } from '@/types/sites';

const IMPORT_OPTIONS: { kind: SiteImportKind; label: string; description: string }[] = [
  { kind: 'sites', label: 'Import Sites', description: 'Site master data.' },
  { kind: 'site-assets', label: 'Import Site Assets', description: 'Asset inventory linked to sites.' },
  { kind: 'power-data', label: 'Import Power Data', description: 'Power telemetry and metrics.' },
  { kind: 'radio-data', label: 'Import Radio Data', description: 'Radio and RAN-related data.' },
  { kind: 'tx-data', label: 'Import TX Data', description: 'Transmission dataset.' },
  { kind: 'sharing-data', label: 'Import Sharing Data', description: 'Tower sharing and tenancy records.' },
  { kind: 'rf-status', label: 'Import RF Status', description: 'RF health and status snapshots.' },
  { kind: 'battery-discharge-tests', label: 'Import BDT Data', description: 'Battery discharge test records.' },
  { kind: 'delta-sites', label: 'Import Delta Sites', description: 'Delta updates for site master changes.' },
];

export default function ImportSitesPage() {
  const importMutation = useImportSiteData();
  const [file, setFile] = useState<File | null>(null);
  const [lastKind, setLastKind] = useState<SiteImportKind | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Import Sites</h1>
        <p className="text-sm text-slate-400">Upload an Excel workbook and choose the import pipeline.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/sites">
          Back to sites
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

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <Input
          accept=".xlsx,.xls"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          type="file"
        />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {IMPORT_OPTIONS.map((option) => (
            <Button
              disabled={importMutation.isPending || !file}
              key={option.kind}
              onClick={async () => {
                if (!file) {
                  setFeedback({ tone: 'error', message: 'Excel file is required.' });
                  return;
                }

                try {
                  const result = await importMutation.mutateAsync({ kind: option.kind, file });
                  setLastKind(option.kind);
                  setFeedback({
                    tone: 'success',
                    message: `${option.label} completed. Imported: ${result.importedCount}, Skipped: ${result.skippedCount}.`,
                  });
                } catch (error) {
                  setFeedback({ tone: 'error', message: toApiError(error).message });
                }
              }}
              type="button"
              variant={option.kind === 'sites' ? 'primary' : 'secondary'}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Import Pipelines</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {IMPORT_OPTIONS.map((option) => (
            <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3" key={option.kind}>
              <p className="text-sm text-slate-100">{option.label}</p>
              <p className="mt-1 text-xs text-slate-400">{option.description}</p>
            </div>
          ))}
        </div>
      </section>

      {importMutation.data?.errors?.length ? (
        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Import Errors</h2>
          {lastKind ? (
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              Pipeline: {lastKind}
            </p>
          ) : null}
          <ul className="mt-3 list-disc pl-5 text-sm text-rose-200">
            {importMutation.data.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
