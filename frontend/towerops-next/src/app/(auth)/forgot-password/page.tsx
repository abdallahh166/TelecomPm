'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForgotPassword } from '@/hooks/use-auth-actions';
import { toApiError } from '@/lib/error-adapter';

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="mx-auto mt-20 max-w-md space-y-6 rounded-xl border border-slate-800 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-400">Request an OTP to reset your password.</p>
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
        <Button
          disabled={forgotPasswordMutation.isPending || !email.trim()}
          onClick={async () => {
            try {
              const result = await forgotPasswordMutation.mutateAsync({ email: email.trim() });
              setFeedback({ tone: 'success', message: result.message });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
        >
          Send OTP
        </Button>
      </div>

      <div className="text-sm">
        <Link className="text-brand-blue underline" href="/reset-password">
          Already have OTP? Reset password
        </Link>
        {' | '}
        <Link className="text-brand-blue underline" href="/login">
          Back to login
        </Link>
      </div>
    </main>
  );
}
