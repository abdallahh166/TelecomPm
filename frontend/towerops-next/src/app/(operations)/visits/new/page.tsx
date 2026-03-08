'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateVisit } from '@/hooks/use-visits';
import { toApiError } from '@/lib/error-adapter';

const VISIT_TYPES = ['BM', 'CM', 'Emergency', 'Installation', 'Upgrade', 'Inspection', 'Commissioning', 'Audit'];

function nowAsDateTimeLocal() {
  return new Date().toISOString().slice(0, 16);
}

export default function NewVisitPage() {
  const router = useRouter();
  const createMutation = useCreateVisit();
  const [siteId, setSiteId] = useState('');
  const [engineerId, setEngineerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(nowAsDateTimeLocal);
  const [type, setType] = useState('BM');
  const [supervisorId, setSupervisorId] = useState('');
  const [technicianNames, setTechnicianNames] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const canSubmit = siteId.trim().length > 0 && engineerId.trim().length > 0 && Boolean(scheduledDate);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Visit</h1>
        <p className="text-sm text-slate-400">Schedule a visit and assign the responsible engineer.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/visits">
          Back to visits
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
          <span>Site ID</span>
          <Input onChange={(event) => setSiteId(event.target.value)} value={siteId} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Engineer ID</span>
          <Input onChange={(event) => setEngineerId(event.target.value)} value={engineerId} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Scheduled Date</span>
          <Input
            onChange={(event) => setScheduledDate(event.target.value)}
            type="datetime-local"
            value={scheduledDate}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Visit Type</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setType(event.target.value)}
            value={type}
          >
            {VISIT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Supervisor ID (optional)</span>
          <Input onChange={(event) => setSupervisorId(event.target.value)} value={supervisorId} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Technician Names (comma separated)</span>
          <Input
            onChange={(event) => setTechnicianNames(event.target.value)}
            placeholder="Tech A, Tech B"
            value={technicianNames}
          />
        </label>
      </section>

      <Button
        disabled={!canSubmit || createMutation.isPending}
        onClick={async () => {
          try {
            const created = await createMutation.mutateAsync({
              siteId: siteId.trim(),
              engineerId: engineerId.trim(),
              scheduledDate: new Date(scheduledDate).toISOString(),
              type,
              supervisorId: supervisorId.trim() || undefined,
              technicianNames: technicianNames
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            });
            setFeedback({ tone: 'success', message: 'Visit created successfully. Redirecting...' });
            router.push(`/visits/${created.id}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create Visit
      </Button>
    </main>
  );
}
