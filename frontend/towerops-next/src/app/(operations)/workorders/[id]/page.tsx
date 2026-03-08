'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import {
  useAssignWorkOrder,
  useCancelWorkOrder,
  useCaptureWorkOrderSignature,
  useCloseWorkOrder,
  useCompleteWorkOrder,
  useStartWorkOrder,
  useSubmitWorkOrderForAcceptance,
  useWorkOrder,
  useWorkOrderSignatures,
} from '@/hooks/use-workorders';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatLabel } from '@/lib/format';

export default function WorkOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const auth = useAuth();
  const workOrderId = params.id;
  const { data, isLoading, isError, refetch } = useWorkOrder(workOrderId);
  const signaturesQuery = useWorkOrderSignatures(workOrderId);
  const assignMutation = useAssignWorkOrder(workOrderId);
  const startMutation = useStartWorkOrder(workOrderId);
  const completeMutation = useCompleteWorkOrder(workOrderId);
  const submitMutation = useSubmitWorkOrderForAcceptance(workOrderId);
  const closeMutation = useCloseWorkOrder(workOrderId);
  const cancelMutation = useCancelWorkOrder(workOrderId);
  const captureSignatureMutation = useCaptureWorkOrderSignature(workOrderId);
  const [engineerId, setEngineerId] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [assignedBy, setAssignedBy] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('Customer');
  const [signatureDataBase64, setSignatureDataBase64] = useState('');
  const [signerPhone, setSignerPhone] = useState('');
  const [signatureLatitude, setSignatureLatitude] = useState('');
  const [signatureLongitude, setSignatureLongitude] = useState('');
  const [isEngineerSignature, setIsEngineerSignature] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!assignedBy && auth.user?.email) {
      setAssignedBy(auth.user.email);
    }
  }, [assignedBy, auth.user?.email]);

  if (isLoading) return <LoadingState label="Loading work order..." />;
  if (isError || !data) return <ErrorState message="Failed to load work order." onRetry={() => refetch()} />;

  const isBusy =
    assignMutation.isPending ||
    startMutation.isPending ||
    completeMutation.isPending ||
    submitMutation.isPending ||
    closeMutation.isPending ||
    cancelMutation.isPending ||
    captureSignatureMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed successfully.` });
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  const canStart = data.status === 'Assigned';
  const canComplete = data.status === 'InProgress';
  const canSubmitForAcceptance = data.status === 'PendingInternalReview';
  const canClose = data.status === 'PendingInternalReview' || data.status === 'PendingCustomerAcceptance';
  const canCancel = data.status !== 'Closed' && data.status !== 'Cancelled';
  const signatures = signaturesQuery.data;

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Work Order {data.woNumber}</h1>
          <p className="text-sm text-slate-400">Internal lifecycle control for the operations team.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={data.status} />
          <StatusBadge status={data.slaClass} />
          <StatusBadge status={data.workOrderType} />
        </div>
      </div>

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Site</p>
          <p className="mt-2 text-sm text-slate-200">{data.siteCode}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Office</p>
          <p className="mt-2 text-sm text-slate-200">{data.officeCode}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Assigned Engineer</p>
          <p className="mt-2 text-sm text-slate-200">{data.assignedEngineerName ?? 'Unassigned'}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Scope</p>
          <p className="mt-2 text-sm text-slate-200">{formatLabel(data.scope)}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Issue Summary</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{data.issueDescription}</p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">SLA Timeline</h2>
            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">SLA Start</dt>
                <dd className="mt-2 text-sm text-slate-200">{formatDateTime(data.slaStartAtUtc)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Assigned At</dt>
                <dd className="mt-2 text-sm text-slate-200">{formatDateTime(data.assignedAtUtc)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Response Deadline</dt>
                <dd className="mt-2 text-sm text-slate-200">{formatDateTime(data.responseDeadlineUtc)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Resolution Deadline</dt>
                <dd className="mt-2 text-sm text-slate-200">{formatDateTime(data.resolutionDeadlineUtc)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Scheduled Visit</dt>
                <dd className="mt-2 text-sm text-slate-200">{formatDateTime(data.scheduledVisitDateUtc)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Signatures</h2>
            {signaturesQuery.isLoading ? (
              <p className="mt-3 text-sm text-slate-400">Loading signatures...</p>
            ) : signaturesQuery.isError ? (
              <p className="mt-3 text-sm text-brand-red">Failed to load signatures.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SignatureCard
                  label="Client Signature"
                  value={signatures?.clientSignature ?? null}
                />
                <SignatureCard
                  label="Engineer Signature"
                  value={signatures?.engineerSignature ?? null}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Assignment</h2>
            <p className="mt-2 text-sm text-slate-400">
              Assign the work order to a specific engineer.
            </p>
            <div className="mt-4 grid gap-3">
              <Input
                onChange={(event) => setEngineerId(event.target.value)}
                placeholder="Engineer ID (GUID)"
                value={engineerId}
              />
              <Input
                onChange={(event) => setEngineerName(event.target.value)}
                placeholder="Engineer Name"
                value={engineerName}
              />
              <Input
                onChange={(event) => setAssignedBy(event.target.value)}
                placeholder="Assigned By"
                value={assignedBy}
              />
              <Button
                disabled={isBusy || !engineerId.trim() || !engineerName.trim() || !assignedBy.trim()}
                onClick={() =>
                  runAction('Assign work order', () =>
                    assignMutation.mutateAsync({
                      engineerId: engineerId.trim(),
                      engineerName: engineerName.trim(),
                      assignedBy: assignedBy.trim(),
                    }),
                  )
                }
                type="button"
              >
                Assign Work Order
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Lifecycle Actions</h2>
            <p className="mt-2 text-sm text-slate-400">
              The enabled actions reflect the current backend work order state machine.
            </p>
            <div className="mt-5 grid gap-3">
              <Button
                disabled={!canStart || isBusy}
                onClick={() => runAction('Start work order', () => startMutation.mutateAsync())}
                type="button"
              >
                Start Work Order
              </Button>
              <Button
                disabled={!canComplete || isBusy}
                onClick={() => runAction('Complete work order', () => completeMutation.mutateAsync())}
                type="button"
              >
                Complete Work Order
              </Button>
              <Button
                disabled={!canSubmitForAcceptance || isBusy}
                onClick={() =>
                  runAction('Submit for customer acceptance', () => submitMutation.mutateAsync())
                }
                type="button"
                variant="secondary"
              >
                Submit For Acceptance
              </Button>
              <Button
                disabled={!canClose || isBusy}
                onClick={() => runAction('Close work order', () => closeMutation.mutateAsync())}
                type="button"
                variant="secondary"
              >
                Close Work Order
              </Button>
              <Button
                disabled={!canCancel || isBusy}
                onClick={() => runAction('Cancel work order', () => cancelMutation.mutateAsync())}
                type="button"
                variant="danger"
              >
                Cancel Work Order
              </Button>
              <Link className="text-sm text-brand-blue underline" href={`/workorders/${data.id}/acceptance`}>
                Open customer acceptance page
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Capture Signature</h2>
            <div className="mt-4 grid gap-3">
              <Input
                onChange={(event) => setSignerName(event.target.value)}
                placeholder="Signer Name"
                value={signerName}
              />
              <Input
                onChange={(event) => setSignerRole(event.target.value)}
                placeholder="Signer Role"
                value={signerRole}
              />
              <Input
                onChange={(event) => setSignerPhone(event.target.value)}
                placeholder="Signer Phone (optional)"
                value={signerPhone}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  onChange={(event) => setSignatureLatitude(event.target.value)}
                  placeholder="Latitude (optional)"
                  type="number"
                  value={signatureLatitude}
                />
                <Input
                  onChange={(event) => setSignatureLongitude(event.target.value)}
                  placeholder="Longitude (optional)"
                  type="number"
                  value={signatureLongitude}
                />
              </div>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                onChange={(event) => setSignatureDataBase64(event.target.value)}
                placeholder="Signature data base64"
                value={signatureDataBase64}
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  checked={isEngineerSignature}
                  className="h-4 w-4 rounded border border-slate-600 bg-slate-900"
                  onChange={(event) => setIsEngineerSignature(event.target.checked)}
                  type="checkbox"
                />
                Engineer signature (unchecked means client signature)
              </label>
              <Button
                disabled={isBusy || !signerName.trim() || !signerRole.trim() || !signatureDataBase64.trim()}
                onClick={() =>
                  runAction('Capture signature', () =>
                    captureSignatureMutation.mutateAsync({
                      signerName: signerName.trim(),
                      signerRole: signerRole.trim(),
                      signatureDataBase64: signatureDataBase64.trim(),
                      signerPhone: signerPhone.trim() || undefined,
                      latitude: signatureLatitude.trim() ? Number(signatureLatitude) : undefined,
                      longitude: signatureLongitude.trim() ? Number(signatureLongitude) : undefined,
                      isEngineerSignature,
                    }),
                  )
                }
                type="button"
              >
                Capture Signature
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SignatureCard({
  label,
  value,
}: {
  label: string;
  value: {
    signerName: string;
    signerRole: string;
    signedAtUtc: string;
    signerPhone?: string;
    latitude?: number;
    longitude?: number;
  } | null;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      {!value ? (
        <p className="mt-2 text-sm text-slate-400">Not captured</p>
      ) : (
        <div className="mt-2 space-y-1 text-sm text-slate-200">
          <p>Name: {value.signerName}</p>
          <p>Role: {value.signerRole}</p>
          <p>Signed At: {formatDateTime(value.signedAtUtc)}</p>
          <p>Phone: {value.signerPhone ?? 'N/A'}</p>
          <p>
            Coordinates:{' '}
            {value.latitude !== undefined && value.longitude !== undefined
              ? `${value.latitude}, ${value.longitude}`
              : 'N/A'}
          </p>
        </div>
      )}
    </div>
  );
}
