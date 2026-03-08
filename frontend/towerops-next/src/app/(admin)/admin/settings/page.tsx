'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useSettings } from '@/hooks/use-settings';
import { formatDateTime } from '@/lib/format';

export default function AdminSettingsPage() {
  const [page, setPage] = useState(1);
  const settingsQuery = useSettings(page, { pageSize: 20 }, true);

  const groups = useMemo(
    () => Array.from(new Set(settingsQuery.data?.data.map((setting) => setting.group) ?? [])),
    [settingsQuery.data],
  );

  if (settingsQuery.isLoading) {
    return <LoadingState label="Loading settings..." />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return <ErrorState message="Failed to load settings." onRetry={() => settingsQuery.refetch()} />;
  }

  if (settingsQuery.data.data.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <Header groups={groups} />
        <EmptyState label="No settings available." />
      </main>
    );
  }

  const rows = settingsQuery.data.data.map((setting) => [
    setting.group,
    setting.key,
    setting.value,
    setting.dataType,
    <StatusBadge key={`${setting.key}-encrypted`} status={setting.isEncrypted ? 'Encrypted' : 'Plain'} />,
    setting.updatedBy,
    formatDateTime(setting.updatedAtUtc),
  ]);

  return (
    <main className="space-y-6 p-6">
      <Header groups={groups} />
      <DataTable
        headers={['Group', 'Key', 'Value', 'Type', 'Security', 'Updated By', 'Updated At']}
        rows={rows}
      />
      <Pagination
        hasNext={settingsQuery.data.pagination.hasNextPage}
        onNext={() => setPage((current) => current + 1)}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        page={page}
      />
    </main>
  );
}

function Header({ groups }: { groups: string[] }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Settings</h1>
          <p className="text-sm text-slate-400">System configuration groups, values, and service test utilities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/admin/settings/test-services">
            Test Services
          </Link>
        </div>
      </div>
      {groups.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-sm">
          {groups.map((group) => (
            <Link
              className="rounded-md border border-slate-700 px-3 py-1 text-brand-blue"
              href={`/admin/settings/${group}`}
              key={group}
            >
              {group}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
