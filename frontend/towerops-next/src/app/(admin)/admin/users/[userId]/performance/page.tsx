'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Input } from '@/components/ui/input';
import { useUser, useUserPerformance } from '@/hooks/use-users';
import { formatPercent } from '@/lib/format';

function defaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
}

function defaultToDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function UserPerformancePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const userQuery = useUser(userId);
  const performanceQuery = useUserPerformance(
    userId,
    fromDate ? new Date(fromDate).toISOString() : undefined,
    toDate ? new Date(toDate).toISOString() : undefined,
  );

  if (userQuery.isLoading || performanceQuery.isLoading) {
    return <LoadingState label="Loading performance metrics..." />;
  }

  if (userQuery.isError || performanceQuery.isError || !userQuery.data || !performanceQuery.data) {
    return <ErrorState message="Failed to load user performance." onRetry={() => performanceQuery.refetch()} />;
  }

  const user = userQuery.data;
  const performance = performanceQuery.data;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">User Performance</h1>
        <p className="text-sm text-slate-400">Visit execution and quality metrics for {user.name}.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href={`/admin/users/${userId}`}>
          Back to user profile
        </Link>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>From Date</span>
          <Input onChange={(event) => setFromDate(event.target.value)} type="date" value={fromDate} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>To Date</span>
          <Input onChange={(event) => setToDate(event.target.value)} type="date" value={toDate} />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Visits" value={`${performance.totalVisits}`} />
        <StatCard label="Completed Visits" value={`${performance.completedVisits}`} />
        <StatCard label="Approved Visits" value={`${performance.approvedVisits}`} />
        <StatCard label="Rejected Visits" value={`${performance.rejectedVisits}`} />
        <StatCard label="On-Time Visits" value={`${performance.onTimeVisits}`} />
        <StatCard label="Completion Rate" value={formatPercent(performance.completionRate)} />
        <StatCard label="Approval Rate" value={formatPercent(performance.approvalRate)} />
        <StatCard label="On-Time Rate" value={formatPercent(performance.onTimeRate)} />
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
