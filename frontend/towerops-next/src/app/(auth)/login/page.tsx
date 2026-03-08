'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type LoginValues = {
  email: string;
  password: string;
  mfaCode?: string;
};

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginValues>();

  const onSubmit = (values: LoginValues) => {
    console.log('login', values);
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-xl border border-slate-800 p-8">
      <h1 className="mb-6 text-2xl font-semibold">TowerOps Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input {...register('email')} placeholder="Email" type="email" />
        <Input {...register('password')} placeholder="Password" type="password" />
        <Input {...register('mfaCode')} placeholder="MFA code (optional)" />
        <Button type="submit">Sign in</Button>
      </form>
    </main>
  );
}
