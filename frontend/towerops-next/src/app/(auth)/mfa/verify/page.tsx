'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVerifyMfaSetup } from '@/hooks/use-auth-actions';
import { toApiError } from '@/lib/error-adapter';

export default function MfaVerifyPage() {
  const router = useRouter();
  const verifyMfaMutation = useVerifyMfaSetup();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="mx-auto mt-20 max-w-md space-y-6 rounded-xl border border-slate-800 p-8">
      <div>
        <h1 className="text-2xl font-semibold">MFA Verify</h1>
        <p className="mt-2 text-sm text-slate-400">Verify MFA setup using your authenticator code.</p>
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
        <Input onChange={(event) => setCode(event.target.value)} placeholder="Authenticator code" value={code} />
        <Button
          disabled={verifyMfaMutation.isPending || !email.trim() || !password.trim() || !code.trim()}
          onClick={async () => {
            try {
              await verifyMfaMutation.mutateAsync({
                email: email.trim(),
                password,
                code: code.trim(),
              });
              setFeedback({ tone: 'success', message: 'MFA verified successfully. Redirecting to login...' });
              router.push('/login');
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
        >
          Verify MFA
        </Button>
      </div>

      <div className="text-sm">
        <Link className="text-brand-blue underline" href="/mfa/setup">
          Back to MFA setup
        </Link>
        {' | '}
        <Link className="text-brand-blue underline" href="/login">
          Back to login
        </Link>
      </div>
    </main>
  );
}
