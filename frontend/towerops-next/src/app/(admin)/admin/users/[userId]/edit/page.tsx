'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateUser, useUser } from '@/hooks/use-users';
import { toApiError } from '@/lib/error-adapter';

export default function EditAdminUserPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params.userId;
  const userQuery = useUser(userId);
  const updateMutation = useUpdateUser();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maxAssignedSites, setMaxAssignedSites] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!userQuery.data) {
      return;
    }

    setName(userQuery.data.name);
    setPhoneNumber(userQuery.data.phoneNumber);
    setMaxAssignedSites(userQuery.data.maxAssignedSites?.toString() ?? '');
    setSpecializations(userQuery.data.specializations.join(', '));
  }, [userQuery.data]);

  if (userQuery.isLoading) {
    return <LoadingState label="Loading user profile..." />;
  }

  if (userQuery.isError || !userQuery.data) {
    return <ErrorState message="Failed to load user profile." onRetry={() => userQuery.refetch()} />;
  }

  const canSubmit = name.trim().length > 0 && phoneNumber.trim().length > 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit User</h1>
        <p className="text-sm text-slate-400">Update profile details, assignment capacity, and specializations.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/admin/users/${userId}`}>
          Back to user profile
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

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Name</span>
          <Input onChange={(event) => setName(event.target.value)} value={name} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Phone Number</span>
          <Input onChange={(event) => setPhoneNumber(event.target.value)} value={phoneNumber} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Max Assigned Sites (optional)</span>
          <Input
            min={1}
            onChange={(event) => setMaxAssignedSites(event.target.value)}
            step="1"
            type="number"
            value={maxAssignedSites}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Specializations (comma separated)</span>
          <Input onChange={(event) => setSpecializations(event.target.value)} value={specializations} />
        </label>
      </section>

      <Button
        disabled={!canSubmit || updateMutation.isPending}
        onClick={async () => {
          try {
            await updateMutation.mutateAsync({
              userId,
              payload: {
                name: name.trim(),
                phoneNumber: phoneNumber.trim(),
                maxAssignedSites: maxAssignedSites ? Number(maxAssignedSites) : undefined,
                specializations: specializations
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              },
            });
            setFeedback({ tone: 'success', message: 'User updated successfully. Redirecting...' });
            router.push(`/admin/users/${userId}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Save Changes
      </Button>
    </main>
  );
}
