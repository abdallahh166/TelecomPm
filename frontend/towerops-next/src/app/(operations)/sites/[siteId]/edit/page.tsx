'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSite, useUpdateSite } from '@/hooks/use-sites';
import { toApiError } from '@/lib/error-adapter';

const SITE_TYPES = [
  'Macro',
  'Nodal',
  'BSC',
  'VIP',
  'Outdoor',
  'Indoor',
  'Repeater',
  'MicroNano',
  'GreenField',
  'RoofTop',
  'BTS',
];

const SITE_STATUSES = ['OnAir', 'OffAir', 'UnderMaintenance', 'Decommissioned'];
const SITE_COMPLEXITIES = ['Low', 'Medium', 'High'];

export default function EditSitePage() {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const siteId = params.siteId;
  const siteQuery = useSite(siteId);
  const updateMutation = useUpdateSite();
  const [name, setName] = useState('');
  const [omcName, setOmcName] = useState('');
  const [siteType, setSiteType] = useState('Macro');
  const [region, setRegion] = useState('');
  const [subRegion, setSubRegion] = useState('');
  const [bscName, setBscName] = useState('');
  const [bscCode, setBscCode] = useState('');
  const [subcontractor, setSubcontractor] = useState('');
  const [maintenanceArea, setMaintenanceArea] = useState('');
  const [status, setStatus] = useState('OnAir');
  const [complexity, setComplexity] = useState('Medium');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!siteQuery.data) {
      return;
    }

    setName(siteQuery.data.name);
    setOmcName(siteQuery.data.omcName);
    setSiteType(siteQuery.data.siteType);
    setRegion(siteQuery.data.region);
    setSubRegion(siteQuery.data.subRegion);
    setStatus(siteQuery.data.status);
    setComplexity(siteQuery.data.complexity);
  }, [siteQuery.data]);

  if (siteQuery.isLoading) {
    return <LoadingState label="Loading site profile..." />;
  }

  if (siteQuery.isError || !siteQuery.data) {
    return <ErrorState message="Failed to load site profile." onRetry={() => siteQuery.refetch()} />;
  }

  const canSubmit = name.trim().length > 0 && omcName.trim().length > 0 && siteType.trim().length > 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Site</h1>
        <p className="text-sm text-slate-400">Update site profile and maintenance classification fields.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/sites/${siteId}`}>
          Back to site profile
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
        <label className="space-y-2 text-sm text-slate-300">
          <span>Name</span>
          <Input onChange={(event) => setName(event.target.value)} value={name} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>OMC Name</span>
          <Input onChange={(event) => setOmcName(event.target.value)} value={omcName} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Site Type</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setSiteType(event.target.value)}
            value={siteType}
          >
            {SITE_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Status</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            {SITE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Complexity</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setComplexity(event.target.value)}
            value={complexity}
          >
            {SITE_COMPLEXITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Region</span>
          <Input onChange={(event) => setRegion(event.target.value)} value={region} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Sub Region</span>
          <Input onChange={(event) => setSubRegion(event.target.value)} value={subRegion} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>BSC Name</span>
          <Input onChange={(event) => setBscName(event.target.value)} value={bscName} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>BSC Code</span>
          <Input onChange={(event) => setBscCode(event.target.value)} value={bscCode} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Subcontractor</span>
          <Input onChange={(event) => setSubcontractor(event.target.value)} value={subcontractor} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Maintenance Area</span>
          <Input onChange={(event) => setMaintenanceArea(event.target.value)} value={maintenanceArea} />
        </label>
      </section>

      <Button
        disabled={!canSubmit || updateMutation.isPending}
        onClick={async () => {
          try {
            await updateMutation.mutateAsync({
              siteId,
              payload: {
                name: name.trim(),
                omcName: omcName.trim(),
                siteType,
                status,
                complexity,
                region: region.trim() || undefined,
                subRegion: subRegion.trim() || undefined,
                bscName: bscName.trim() || undefined,
                bscCode: bscCode.trim() || undefined,
                subcontractor: subcontractor.trim() || undefined,
                maintenanceArea: maintenanceArea.trim() || undefined,
              },
            });
            setFeedback({ tone: 'success', message: 'Site updated successfully. Redirecting...' });
            router.push(`/sites/${siteId}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Save Site
      </Button>
    </main>
  );
}
