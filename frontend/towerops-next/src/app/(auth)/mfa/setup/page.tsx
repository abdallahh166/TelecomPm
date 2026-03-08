'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSetupMfa } from '@/hooks/use-auth-actions';
import { toApiError } from '@/lib/error-adapter';

export default function MfaSetupPage() {
  const setupMfaMutation = useSetupMfa();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="mx-auto mt-20 max-w-md space-y-6 rounded-xl border border-slate-800 p-8">
      <div>
        <h1 className="text-2xl font-semibold">MFA Setup</h1>
        <p className="mt-2 text-sm text-slate-400">Generate MFA secret and authenticator URI for your account.</p>
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

      <div className="space-y-4">
        <Input onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" value={email} />
        <Input
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          value={password}
        />
        <Button
          disabled={setupMfaMutation.isPending || !email.trim() || !password.trim()}
          onClick={async () => {
            try {
              const result = await setupMfaMutation.mutateAsync({
                email: email.trim(),
                password,
              });
              setFeedback({
                tone: 'success',
                message: `Secret: ${result.secret}`,
              });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
        >
          Generate MFA Secret
        </Button>
      </div>

      {setupMfaMutation.data ? (
        <section className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm">
          <p className="text-slate-300">
            Secret: <span className="text-slate-100">{setupMfaMutation.data.secret}</span>
          </p>
          <p className="break-all text-slate-300">
            OTP URI: <span className="text-slate-100">{setupMfaMutation.data.otpAuthUri}</span>
          </p>
        </section>
      ) : null}

      <div className="text-sm">
        <Link className="text-brand-blue underline" href="/mfa/verify">
          Continue to MFA verification
        </Link>
        {' | '}
        <Link className="text-brand-blue underline" href="/login">
          Back to login
        </Link>
      </div>
    </main>
  );
}
