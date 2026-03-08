'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useCreateSite } from '@/hooks/use-sites';
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

export default function NewSitePage() {
  const auth = useAuth();
  const router = useRouter();
  const createMutation = useCreateSite();
  const [siteCode, setSiteCode] = useState('');
  const [name, setName] = useState('');
  const [omcName, setOmcName] = useState('');
  const [region, setRegion] = useState('');
  const [subRegion, setSubRegion] = useState('');
  const [latitude, setLatitude] = useState('30.0444');
  const [longitude, setLongitude] = useState('31.2357');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [siteType, setSiteType] = useState('Macro');
  const [bscName, setBscName] = useState('');
  const [bscCode, setBscCode] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const officeId = auth.user?.officeId;
  if (!officeId) {
    return <ErrorState message="Your account is missing office assignment." />;
  }

  const canSubmit =
    siteCode.trim().length > 0 &&
    name.trim().length > 0 &&
    omcName.trim().length > 0 &&
    region.trim().length > 0 &&
    subRegion.trim().length > 0 &&
    city.trim().length > 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Site</h1>
        <p className="text-sm text-slate-400">Create a site profile with geolocation and network attributes.</p>
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

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Site Code</span>
          <Input onChange={(event) => setSiteCode(event.target.value.toUpperCase())} value={siteCode} />
        </label>
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
          <span>Region</span>
          <Input onChange={(event) => setRegion(event.target.value)} value={region} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Sub Region</span>
          <Input onChange={(event) => setSubRegion(event.target.value)} value={subRegion} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Latitude</span>
          <Input onChange={(event) => setLatitude(event.target.value)} type="number" value={latitude} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Longitude</span>
          <Input onChange={(event) => setLongitude(event.target.value)} type="number" value={longitude} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>City</span>
          <Input onChange={(event) => setCity(event.target.value)} value={city} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Street (optional)</span>
          <Input onChange={(event) => setStreet(event.target.value)} value={street} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Address Details (optional)</span>
          <Input onChange={(event) => setAddressDetails(event.target.value)} value={addressDetails} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>BSC Name (optional)</span>
          <Input onChange={(event) => setBscName(event.target.value)} value={bscName} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>BSC Code (optional)</span>
          <Input onChange={(event) => setBscCode(event.target.value)} value={bscCode} />
        </label>
      </section>

      <Button
        disabled={!canSubmit || createMutation.isPending}
        onClick={async () => {
          try {
            const created = await createMutation.mutateAsync({
              siteCode: siteCode.trim(),
              name: name.trim(),
              omcName: omcName.trim(),
              officeId,
              region: region.trim(),
              subRegion: subRegion.trim(),
              latitude: Number(latitude),
              longitude: Number(longitude),
              address: {
                street: street.trim() || undefined,
                city: city.trim(),
                region: region.trim(),
                details: addressDetails.trim() || undefined,
              },
              siteType,
              bscName: bscName.trim() || undefined,
              bscCode: bscCode.trim() || undefined,
            });
            setFeedback({ tone: 'success', message: 'Site created successfully. Redirecting...' });
            router.push(`/sites/${created.id}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create Site
      </Button>
    </main>
  );
}
