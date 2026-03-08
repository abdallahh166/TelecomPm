'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettingsByGroup, useUpsertSettings } from '@/hooks/use-settings';
import { toApiError } from '@/lib/error-adapter';

export default function SettingsGroupPage() {
  const params = useParams<{ group: string }>();
  const group = decodeURIComponent(params.group);
  const groupQuery = useSettingsByGroup(group);
  const upsertMutation = useUpsertSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!groupQuery.data) {
      return;
    }

    setValues(
      Object.fromEntries(groupQuery.data.map((item) => [item.key, item.value])),
    );
  }, [groupQuery.data]);

  if (groupQuery.isLoading) {
    return <LoadingState label="Loading settings group..." />;
  }

  if (groupQuery.isError || !groupQuery.data) {
    return <ErrorState message="Failed to load settings group." onRetry={() => groupQuery.refetch()} />;
  }

  if (groupQuery.data.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Settings Group: {group}</h1>
        <section className="text-sm">
          <Link className="text-brand-blue underline" href="/admin/settings">
            Back to settings
          </Link>
        </section>
        <EmptyState label="No settings found for this group." />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings Group: {group}</h1>
        <p className="text-sm text-slate-400">Edit values and persist updates for this settings group.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/admin/settings">
          Back to settings
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

      <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        {groupQuery.data.map((setting) => (
          <div className="grid gap-3 rounded-md border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-2" key={setting.key}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Key</p>
              <p className="mt-2 text-sm text-slate-100">{setting.key}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Type</p>
              <p className="mt-2 text-sm text-slate-100">{setting.dataType}</p>
            </div>
            <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
              <span>Value</span>
              <Input
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [setting.key]: event.target.value,
                  }))
                }
                value={values[setting.key] ?? ''}
              />
            </label>
            {setting.description ? (
              <p className="text-xs text-slate-400 md:col-span-2">{setting.description}</p>
            ) : null}
          </div>
        ))}
      </section>

      <Button
        disabled={upsertMutation.isPending}
        onClick={async () => {
          try {
            await upsertMutation.mutateAsync(
              groupQuery.data.map((setting) => ({
                key: setting.key,
                value: values[setting.key] ?? '',
                group: setting.group,
                dataType: setting.dataType,
                description: setting.description ?? undefined,
                isEncrypted: setting.isEncrypted,
              })),
            );
            setFeedback({ tone: 'success', message: 'Settings saved successfully.' });
            await groupQuery.refetch();
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Save Group Settings
      </Button>
    </main>
  );
}
