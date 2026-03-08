'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useCreateEscalation } from '@/hooks/use-escalations';
import { toApiError } from '@/lib/error-adapter';
import { EscalationLevel, SlaClass } from '@/types/escalations';

const SLA_CLASSES: SlaClass[] = ['P1', 'P2', 'P3', 'P4'];
const ESCALATION_LEVELS: EscalationLevel[] = ['AreaManager', 'BMManagement', 'ProjectSponsor'];

export default function NewEscalationPage() {
  const auth = useAuth();
  const router = useRouter();
  const createMutation = useCreateEscalation();
  const [workOrderId, setWorkOrderId] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [slaClass, setSlaClass] = useState<SlaClass>('P2');
  const [financialImpactEgp, setFinancialImpactEgp] = useState('0');
  const [slaImpactPercentage, setSlaImpactPercentage] = useState('0');
  const [evidencePackage, setEvidencePackage] = useState('');
  const [previousActions, setPreviousActions] = useState('');
  const [recommendedDecision, setRecommendedDecision] = useState('');
  const [level, setLevel] = useState<EscalationLevel>('AreaManager');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const submittedBy = auth.user?.email ?? '';
  const canSubmit =
    workOrderId.trim() &&
    incidentId.trim() &&
    siteCode.trim() &&
    evidencePackage.trim() &&
    previousActions.trim() &&
    recommendedDecision.trim() &&
    submittedBy;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Escalation</h1>
        <p className="text-sm text-slate-400">Create an escalation case for SLA-impact incidents and management routing.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/escalations">
          Back to escalations
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
        <Field label="Work Order ID">
          <Input onChange={(event) => setWorkOrderId(event.target.value)} value={workOrderId} />
        </Field>
        <Field label="Incident ID">
          <Input onChange={(event) => setIncidentId(event.target.value.toUpperCase())} value={incidentId} />
        </Field>
        <Field label="Site Code">
          <Input onChange={(event) => setSiteCode(event.target.value.toUpperCase())} value={siteCode} />
        </Field>
        <Field label="Submitted By">
          <Input disabled value={submittedBy} />
        </Field>
        <Field label="SLA Class">
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setSlaClass(event.target.value as SlaClass)}
            value={slaClass}
          >
            {SLA_CLASSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Escalation Level">
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setLevel(event.target.value as EscalationLevel)}
            value={level}
          >
            {ESCALATION_LEVELS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Financial Impact (EGP)">
          <Input
            min={0}
            onChange={(event) => setFinancialImpactEgp(event.target.value)}
            step="0.01"
            type="number"
            value={financialImpactEgp}
          />
        </Field>
        <Field label="SLA Impact %">
          <Input
            max={100}
            min={0}
            onChange={(event) => setSlaImpactPercentage(event.target.value)}
            step="0.01"
            type="number"
            value={slaImpactPercentage}
          />
        </Field>
        <Field label="Evidence Package">
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setEvidencePackage(event.target.value)}
            value={evidencePackage}
          />
        </Field>
        <Field label="Previous Actions">
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setPreviousActions(event.target.value)}
            value={previousActions}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Recommended Decision">
            <textarea
              className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              onChange={(event) => setRecommendedDecision(event.target.value)}
              value={recommendedDecision}
            />
          </Field>
        </div>
      </section>

      <Button
        disabled={!canSubmit || createMutation.isPending}
        onClick={async () => {
          try {
            const created = await createMutation.mutateAsync({
              workOrderId: workOrderId.trim(),
              incidentId: incidentId.trim(),
              siteCode: siteCode.trim(),
              slaClass,
              financialImpactEgp: Number(financialImpactEgp),
              slaImpactPercentage: Number(slaImpactPercentage),
              evidencePackage: evidencePackage.trim(),
              previousActions: previousActions.trim(),
              recommendedDecision: recommendedDecision.trim(),
              level,
              submittedBy,
            });
            setFeedback({ tone: 'success', message: 'Escalation created. Redirecting to details...' });
            router.push(`/escalations/${created.id}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create Escalation
      </Button>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  );
}
