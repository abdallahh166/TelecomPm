'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { LoginRequest } from '@/types/auth';
import { toApiError } from '@/lib/error-adapter';
import { useState } from 'react';

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginRequest>();
  const auth = useAuth();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (values: LoginRequest) => {
    try {
      setErrorMessage(null);
      await auth.login(values);
      router.push('/workorders');
    } catch (error) {
      const parsed = toApiError(error);
      setErrorMessage(parsed.message);
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-xl border border-slate-800 p-8">
      <h1 className="mb-6 text-2xl font-semibold">TowerOps Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input {...register('email', { required: true })} placeholder="Email" type="email" />
        <Input {...register('password', { required: true })} placeholder="Password" type="password" />
        <Input {...register('mfaCode')} placeholder="MFA code (optional)" />
        {errorMessage ? <p className="text-sm text-brand-red">{errorMessage}</p> : null}
        <Button type="submit">Sign in</Button>
      </form>
    </main>
  );
}
