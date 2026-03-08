'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useChangePassword } from '@/hooks/use-auth-actions';
import { toApiError } from '@/lib/error-adapter';

export default function ChangePasswordPage() {
  const auth = useAuth();
  const changePasswordMutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (!auth.isAuthenticated) {
    return (
      <main className="mx-auto mt-20 max-w-md space-y-4 rounded-xl border border-slate-800 p-8">
        <h1 className="text-2xl font-semibold">Change Password</h1>
        <p className="text-sm text-slate-300">You need to sign in before changing your password.</p>
        <Link className="text-brand-blue underline text-sm" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-20 max-w-md space-y-6 rounded-xl border border-slate-800 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Change Password</h1>
        <p className="mt-2 text-sm text-slate-400">Update your current account password.</p>
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
        <Input
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder="Current password"
          type="password"
          value={currentPassword}
        />
        <Input
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="New password"
          type="password"
          value={newPassword}
        />
        <Input
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm new password"
          type="password"
          value={confirmPassword}
        />
        <Button
          disabled={
            changePasswordMutation.isPending ||
            !currentPassword.trim() ||
            !newPassword.trim() ||
            !confirmPassword.trim()
          }
          onClick={async () => {
            try {
              const result = await changePasswordMutation.mutateAsync({
                currentPassword,
                newPassword,
                confirmPassword,
              });
              setFeedback({ tone: 'success', message: result.message });
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            } catch (error) {
              setFeedback({ tone: 'error', message: toApiError(error).message });
            }
          }}
          type="button"
        >
          Change Password
        </Button>
      </div>

      <div className="text-sm">
        <Link className="text-brand-blue underline" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
