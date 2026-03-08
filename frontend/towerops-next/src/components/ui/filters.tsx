import { ReactNode } from 'react';

export function Filters({ children }: { children: ReactNode }) {
  return <div className="mb-4 grid gap-3 rounded-lg border border-slate-800 p-4 md:grid-cols-3">{children}</div>;
}
