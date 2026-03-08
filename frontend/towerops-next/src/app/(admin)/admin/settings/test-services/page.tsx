'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTestSettingsService } from '@/hooks/use-settings';
import { toApiError } from '@/lib/error-adapter';
import { SettingsTestService } from '@/types/settings';

const SERVICES: SettingsTestService[] = ['twilio', 'email', 'firebase'];

export default function SettingsTestServicesPage() {
  const testMutation = useTestSettingsService();
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [lastService, setLastService] = useState<SettingsTestService | null>(null);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Test Services</h1>
        <p className="text-sm text-slate-400">Run connectivity tests for notification and messaging integrations.</p>
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

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-3">
        {SERVICES.map((service) => (
          <Button
            disabled={testMutation.isPending}
            key={service}
            onClick={async () => {
              setLastService(service);
              try {
                const result = await testMutation.mutateAsync(service);
                setFeedback({ tone: 'success', message: `${service.toUpperCase()} test succeeded: ${result.message}` });
              } catch (error) {
                setFeedback({ tone: 'error', message: `${service.toUpperCase()} test failed: ${toApiError(error).message}` });
              }
            }}
            type="button"
            variant="secondary"
          >
            Test {service.toUpperCase()}
          </Button>
        ))}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
        Last executed service: {lastService ? lastService.toUpperCase() : 'None'}
      </section>
    </main>
  );
}
