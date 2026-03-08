'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOffice, useUpdateOffice, useUpdateOfficeContact } from '@/hooks/use-offices';
import { toApiError } from '@/lib/error-adapter';

export default function EditOfficePage() {
  const params = useParams<{ officeId: string }>();
  const router = useRouter();
  const officeId = params.officeId;
  const officeQuery = useOffice(officeId);
  const updateOfficeMutation = useUpdateOffice();
  const updateContactMutation = useUpdateOfficeContact();
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

  useEffect(() => {
    if (!officeQuery.data) {
      return;
    }

    setName(officeQuery.data.name);
    setRegion(officeQuery.data.region);
    setCity(officeQuery.data.city);
    setStreet(officeQuery.data.street ?? '');
    setLatitude(officeQuery.data.latitude?.toString() ?? '');
    setLongitude(officeQuery.data.longitude?.toString() ?? '');
    setContactPerson(officeQuery.data.contactPerson ?? '');
    setContactPhone(officeQuery.data.contactPhone ?? '');
    setContactEmail(officeQuery.data.contactEmail ?? '');
  }, [officeQuery.data]);

  if (officeQuery.isLoading) {
    return <LoadingState label="Loading office..." />;
  }

  if (officeQuery.isError || !officeQuery.data) {
    return <ErrorState message="Failed to load office." onRetry={() => officeQuery.refetch()} />;
  }

  const canSubmit = name.trim().length > 0 && region.trim().length > 0 && city.trim().length > 0;
  const isBusy = updateOfficeMutation.isPending || updateContactMutation.isPending;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Office</h1>
        <p className="text-sm text-slate-400">Update office location and contact details.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/admin/offices/${officeId}`}>
          Back to office profile
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
          <span>Region</span>
          <Input onChange={(event) => setRegion(event.target.value)} value={region} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>City</span>
          <Input onChange={(event) => setCity(event.target.value)} value={city} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Street</span>
          <Input onChange={(event) => setStreet(event.target.value)} value={street} />
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
          <span>Contact Person</span>
          <Input onChange={(event) => setContactPerson(event.target.value)} value={contactPerson} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Contact Phone</span>
          <Input onChange={(event) => setContactPhone(event.target.value)} value={contactPhone} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Contact Email</span>
          <Input onChange={(event) => setContactEmail(event.target.value)} type="email" value={contactEmail} />
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={!canSubmit || isBusy}
          onClick={async () => {
            try {
              await updateOfficeMutation.mutateAsync({
                officeId,
                payload: {
                  name: name.trim(),
                  region: region.trim(),
                  address: {
                    city: city.trim(),
                    region: region.trim(),
                    street: street.trim() || undefined,
                  },
                  latitude: latitude ? Number(latitude) : undefined,
                  longitude: longitude ? Number(longitude) : undefined,
                },
              });
              setFeedback({ tone: 'success', message: 'Office profile updated successfully.' });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
        >
          Save Office Profile
        </Button>
        <Button
          disabled={isBusy}
          onClick={async () => {
            try {
              await updateContactMutation.mutateAsync({
                officeId,
                payload: {
                  contactPerson: contactPerson.trim() || undefined,
                  contactPhone: contactPhone.trim() || undefined,
                  contactEmail: contactEmail.trim() || undefined,
                },
              });
              setFeedback({ tone: 'success', message: 'Office contact updated successfully. Redirecting...' });
              router.push(`/admin/offices/${officeId}`);
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
          variant="secondary"
        >
          Save Contact Details
        </Button>
      </div>
    </main>
  );
}
