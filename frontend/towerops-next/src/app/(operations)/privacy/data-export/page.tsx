'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ui/action-button';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useDataExportRequest, useRequestDataExport } from '@/hooks/use-data-exports';

export default function PrivacyDataExportPage() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const requestMutation = useRequestDataExport();
  const requestQuery = useDataExportRequest(requestId);

  const createExport = async () => {
    const result = await requestMutation.mutateAsync();
    setRequestId(result.requestId);
  };

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Privacy / Data Export</h1>
      <ActionButton variant="primary" onClick={createExport}>
        Request My Data Export
      </ActionButton>
      {requestMutation.isPending ? <LoadingState label="Creating export request..." /> : null}
      {requestMutation.isError ? <ErrorState message="Failed to request data export" /> : null}

      {requestQuery.isLoading ? <LoadingState label="Loading export status..." /> : null}
      {requestQuery.data ? (
        <div className="rounded-lg border border-slate-800 p-4 text-sm text-slate-300">
          <p>Request ID: {requestQuery.data.requestId}</p>
          <p>Status: {requestQuery.data.status}</p>
          <p>Requested: {new Date(requestQuery.data.requestedAtUtc).toLocaleString()}</p>
          <p>Expires: {new Date(requestQuery.data.expiresAtUtc).toLocaleString()}</p>
        </div>
      ) : null}
    </main>
  );
}
