'use client';

import { useReportCards } from '@/hooks/use-reports';

export default function ReportsPage() {
  const reports = useReportCards();

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4" key={r.key}>
            <h2 className="text-lg font-medium">{r.title}</h2>
            <p className="mt-2 text-sm text-slate-400">Endpoint: {r.endpoint}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
