'use client';

import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { PerformanceChart } from '@/components/charts/performance-chart';
import { useIssueAnalytics, useVisitCompletionTrends } from '@/hooks/use-analytics';

export default function AnalyticsPage() {
  const trend = useVisitCompletionTrends();
  const issues = useIssueAnalytics();

  if (trend.isLoading || issues.isLoading) return <LoadingState label="Loading analytics..." />;
  if (trend.isError || issues.isError || !trend.data || !issues.data) return <ErrorState message="Failed to load analytics" onRetry={() => { trend.refetch(); issues.refetch(); }} />;

  return (
    <main className="grid gap-6 p-6 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Visit Completion Trends</h1>
        <PerformanceChart data={trend.data} />
      </div>
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Issue Analytics</h1>
        <PerformanceChart data={issues.data} />
      </div>
    </main>
  );
}
