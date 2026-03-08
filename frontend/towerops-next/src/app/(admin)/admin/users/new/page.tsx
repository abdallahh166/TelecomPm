'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useCreateUser } from '@/hooks/use-users';
import { toApiError } from '@/lib/error-adapter';

const ROLE_OPTIONS = [
  'Admin',
  'OperationsManager',
  'PMEngineer',
  'FieldEngineer',
  'Reviewer',
  'InventoryManager',
  'Viewer',
];

export default function NewAdminUserPage() {
  const auth = useAuth();
  const router = useRouter();
  const createUserMutation = useCreateUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('FieldEngineer');
  const [officeId, setOfficeId] = useState(auth.user?.officeId ?? '');
  const [maxAssignedSites, setMaxAssignedSites] = useState('5');
  const [specializations, setSpecializations] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (!auth.user?.officeId) {
    return <ErrorState message="Your account is missing office assignment." />;
  }

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    password.length >= 8 &&
    role.trim().length > 0 &&
    officeId.trim().length > 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New User</h1>
        <p className="text-sm text-slate-400">Create a new user account and assign initial role and capacity.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/admin/users">
          Back to users
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
          <span>Email</span>
          <Input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Phone Number</span>
          <Input onChange={(event) => setPhoneNumber(event.target.value)} value={phoneNumber} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Password</span>
          <Input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Role</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setRole(event.target.value)}
            value={role}
          >
            {ROLE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Office ID</span>
          <Input onChange={(event) => setOfficeId(event.target.value)} value={officeId} />
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
          <Input
            onChange={(event) => setSpecializations(event.target.value)}
            placeholder="Power, Cooling, RF"
            value={specializations}
          />
        </label>
      </section>

      <Button
        disabled={!canSubmit || createUserMutation.isPending}
        onClick={async () => {
          try {
            const created = await createUserMutation.mutateAsync({
              name: name.trim(),
              email: email.trim(),
              phoneNumber: phoneNumber.trim(),
              password,
              role,
              officeId: officeId.trim(),
              maxAssignedSites: maxAssignedSites ? Number(maxAssignedSites) : undefined,
              specializations: specializations
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            });
            setFeedback({ tone: 'success', message: 'User created successfully. Redirecting to profile...' });
            router.push(`/admin/users/${created.id}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create User
      </Button>
    </main>
  );
}
