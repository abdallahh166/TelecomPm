'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks/use-auth-actions';
import { toApiError } from '@/lib/error-adapter';

export default function ResetPasswordPage() {
  const resetPasswordMutation = useResetPassword();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <main className="mx-auto mt-20 max-w-md space-y-6 rounded-xl border border-slate-800 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-400">Provide OTP and set your new password.</p>
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
        <Input onChange={(event) => setOtp(event.target.value)} placeholder="OTP code" value={otp} />
        <Input
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="New password"
          type="password"
          value={newPassword}
        />
        <Button
          disabled={resetPasswordMutation.isPending || !email.trim() || !otp.trim() || !newPassword.trim()}
          onClick={async () => {
            try {
              const result = await resetPasswordMutation.mutateAsync({
                email: email.trim(),
                otp: otp.trim(),
                newPassword,
              });
              setFeedback({ tone: 'success', message: result.message });
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
        >
          Reset Password
        </Button>
      </div>

      <div className="text-sm">
        <Link className="text-brand-blue underline" href="/login">
          Back to login
        </Link>
      </div>
    </main>
  );
}
