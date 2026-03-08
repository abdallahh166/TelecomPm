'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateWorkOrder } from '@/hooks/use-workorders';
import { toApiError } from '@/lib/error-adapter';

const WORK_ORDER_TYPES = ['CM', 'PM'];
const SLA_CLASSES = ['P1', 'P2', 'P3', 'P4'];
const WORK_ORDER_SCOPES = ['ClientEquipment', 'TowerInfrastructure'];

function nowAsDateTimeLocal() {
  return new Date().toISOString().slice(0, 16);
}

export default function NewWorkOrderPage() {
  const router = useRouter();
  const createMutation = useCreateWorkOrder();
  const [woNumber, setWoNumber] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [officeCode, setOfficeCode] = useState('');
  const [workOrderType, setWorkOrderType] = useState('CM');
  const [slaClass, setSlaClass] = useState('P3');
  const [scope, setScope] = useState('ClientEquipment');
  const [scheduledVisitDateUtc, setScheduledVisitDateUtc] = useState(nowAsDateTimeLocal);
  const [issueDescription, setIssueDescription] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const canSubmit =
    woNumber.trim().length > 0 &&
    siteCode.trim().length > 0 &&
    officeCode.trim().length > 0 &&
    issueDescription.trim().length > 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Work Order</h1>
        <p className="text-sm text-slate-400">Create a work order and initialize SLA and execution metadata.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/workorders">
          Back to work orders
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
          <span>WO Number</span>
          <Input onChange={(event) => setWoNumber(event.target.value.toUpperCase())} value={woNumber} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Site Code</span>
          <Input onChange={(event) => setSiteCode(event.target.value.toUpperCase())} value={siteCode} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Office Code</span>
          <Input onChange={(event) => setOfficeCode(event.target.value.toUpperCase())} value={officeCode} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Work Order Type</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setWorkOrderType(event.target.value)}
            value={workOrderType}
          >
            {WORK_ORDER_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>SLA Class</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setSlaClass(event.target.value)}
            value={slaClass}
          >
            {SLA_CLASSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Scope</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setScope(event.target.value)}
            value={scope}
          >
            {WORK_ORDER_SCOPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Scheduled Visit Date (optional)</span>
          <Input
            onChange={(event) => setScheduledVisitDateUtc(event.target.value)}
            type="datetime-local"
            value={scheduledVisitDateUtc}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Issue Description</span>
          <textarea
            className="min-h-[110px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setIssueDescription(event.target.value)}
            value={issueDescription}
          />
        </label>
      </section>

      <Button
        disabled={!canSubmit || createMutation.isPending}
        onClick={async () => {
          try {
            const created = await createMutation.mutateAsync({
              woNumber: woNumber.trim(),
              siteCode: siteCode.trim(),
              officeCode: officeCode.trim(),
              workOrderType,
              scheduledVisitDateUtc: scheduledVisitDateUtc
                ? new Date(scheduledVisitDateUtc).toISOString()
                : undefined,
              slaClass,
              scope,
              issueDescription: issueDescription.trim(),
            });
            setFeedback({ tone: 'success', message: 'Work order created successfully. Redirecting...' });
            router.push(`/workorders/${created.id}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create Work Order
      </Button>
    </main>
  );
}
