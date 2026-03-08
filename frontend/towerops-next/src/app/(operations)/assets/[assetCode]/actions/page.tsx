'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useAsset,
  useMarkAssetFaulty,
  useRecordAssetService,
  useReplaceAsset,
} from '@/hooks/use-assets';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime } from '@/lib/format';

export default function AssetActionsPage() {
  const params = useParams<{ assetCode: string }>();
  const assetCode = params.assetCode;
  const assetQuery = useAsset(assetCode);
  const recordServiceMutation = useRecordAssetService(assetCode);
  const markFaultyMutation = useMarkAssetFaulty(assetCode);
  const replaceMutation = useReplaceAsset(assetCode);
  const [serviceType, setServiceType] = useState('');
  const [serviceEngineerId, setServiceEngineerId] = useState('');
  const [serviceVisitId, setServiceVisitId] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [faultReason, setFaultReason] = useState('');
  const [faultEngineerId, setFaultEngineerId] = useState('');
  const [replacementAssetId, setReplacementAssetId] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (assetQuery.isLoading) {
    return <LoadingState label="Loading asset actions..." />;
  }

  if (assetQuery.isError || !assetQuery.data) {
    return <ErrorState message="Failed to load asset." onRetry={() => assetQuery.refetch()} />;
  }

  const asset = assetQuery.data;
  const isBusy = recordServiceMutation.isPending || markFaultyMutation.isPending || replaceMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed successfully.` });
      await assetQuery.refetch();
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Asset Actions {asset.assetCode}</h1>
          <p className="text-sm text-slate-400">Record service, mark fault, or replace this asset.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={asset.status} />
          <StatusBadge status={asset.type} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/assets/${asset.assetCode}`}>
          Back to asset detail
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

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Site" value={asset.siteCode} />
        <StatCard label="Installed At" value={formatDateTime(asset.installedAtUtc)} />
        <StatCard label="Last Service" value={formatDateTime(asset.lastServicedAtUtc)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Record Service</h2>
          <Input
            onChange={(event) => setServiceType(event.target.value)}
            placeholder="Service type (Preventive, Corrective...)"
            value={serviceType}
          />
          <Input
            onChange={(event) => setServiceEngineerId(event.target.value)}
            placeholder="Engineer ID (optional)"
            value={serviceEngineerId}
          />
          <Input
            onChange={(event) => setServiceVisitId(event.target.value)}
            placeholder="Visit ID (optional)"
            value={serviceVisitId}
          />
          <textarea
            className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setServiceNotes(event.target.value)}
            placeholder="Service notes"
            value={serviceNotes}
          />
          <Button
            disabled={isBusy || !serviceType.trim()}
            onClick={() =>
              runAction('Record service', () =>
                recordServiceMutation.mutateAsync({
                  serviceType: serviceType.trim(),
                  engineerId: serviceEngineerId.trim() || undefined,
                  visitId: serviceVisitId.trim() || undefined,
                  notes: serviceNotes.trim() || undefined,
                }),
              )
            }
            type="button"
          >
            Record Service
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Mark As Faulty</h2>
          <textarea
            className="min-h-[130px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setFaultReason(event.target.value)}
            placeholder="Fault reason (optional)"
            value={faultReason}
          />
          <Input
            onChange={(event) => setFaultEngineerId(event.target.value)}
            placeholder="Engineer ID (optional)"
            value={faultEngineerId}
          />
          <Button
            disabled={isBusy}
            onClick={() =>
              runAction('Mark faulty', () =>
                markFaultyMutation.mutateAsync({
                  reason: faultReason.trim() || undefined,
                  engineerId: faultEngineerId.trim() || undefined,
                }),
              )
            }
            type="button"
            variant="danger"
          >
            Mark Faulty
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Replace Asset</h2>
          <Input
            onChange={(event) => setReplacementAssetId(event.target.value)}
            placeholder="New Asset ID (GUID)"
            value={replacementAssetId}
          />
          <p className="text-xs text-slate-400">
            Use an existing asset ID that will replace this asset in the backend lifecycle.
          </p>
          <Button
            disabled={isBusy || !replacementAssetId.trim()}
            onClick={() =>
              runAction('Replace asset', () =>
                replaceMutation.mutateAsync({
                  newAssetId: replacementAssetId.trim(),
                }),
              )
            }
            type="button"
            variant="secondary"
          >
            Replace Asset
          </Button>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
