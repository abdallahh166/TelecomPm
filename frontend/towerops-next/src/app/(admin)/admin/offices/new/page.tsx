'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateOffice } from '@/hooks/use-offices';
import { toApiError } from '@/lib/error-adapter';

export default function NewOfficePage() {
  const router = useRouter();
  const createMutation = useCreateOffice();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const canSubmit =
    code.trim().length >= 3 && name.trim().length > 0 && region.trim().length > 0 && city.trim().length > 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Office</h1>
        <p className="text-sm text-slate-400">Create an operational office with location and contact metadata.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/admin/offices">
          Back to offices
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
          <span>Code</span>
          <Input onChange={(event) => setCode(event.target.value.toUpperCase())} value={code} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Name</span>
          <Input onChange={(event) => setName(event.target.value)} value={name} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Region</span>
          <Input onChange={(event) => setRegion(event.target.value)} value={region} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>City</span>
          <Input onChange={(event) => setCity(event.target.value)} value={city} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Street (optional)</span>
          <Input onChange={(event) => setStreet(event.target.value)} value={street} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Latitude (optional)</span>
          <Input onChange={(event) => setLatitude(event.target.value)} type="number" value={latitude} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Longitude (optional)</span>
          <Input onChange={(event) => setLongitude(event.target.value)} type="number" value={longitude} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Contact Person (optional)</span>
          <Input onChange={(event) => setContactPerson(event.target.value)} value={contactPerson} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Contact Phone (optional)</span>
          <Input onChange={(event) => setContactPhone(event.target.value)} value={contactPhone} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Contact Email (optional)</span>
          <Input onChange={(event) => setContactEmail(event.target.value)} type="email" value={contactEmail} />
        </label>
      </section>

      <Button
        disabled={!canSubmit || createMutation.isPending}
        onClick={async () => {
          try {
            const created = await createMutation.mutateAsync({
              code: code.trim(),
              name: name.trim(),
              region: region.trim(),
              address: {
                street: street.trim() || undefined,
                city: city.trim(),
                region: region.trim(),
              },
              latitude: latitude ? Number(latitude) : undefined,
              longitude: longitude ? Number(longitude) : undefined,
              contactPerson: contactPerson.trim() || undefined,
              contactPhone: contactPhone.trim() || undefined,
              contactEmail: contactEmail.trim() || undefined,
            });
            setFeedback({ tone: 'success', message: 'Office created successfully. Redirecting...' });
            router.push(`/admin/offices/${created.id}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create Office
      </Button>
    </main>
  );
}
