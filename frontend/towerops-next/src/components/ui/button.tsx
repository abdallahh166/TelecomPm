import { ButtonHTMLAttributes } from 'react';

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-md bg-brand-blue px-4 py-2 font-medium text-slate-950 hover:opacity-90 disabled:opacity-50"
    />
  );
}
