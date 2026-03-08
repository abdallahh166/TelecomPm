import { apiClient } from '@/lib/api-client';
import { AnalyticsPoint } from '@/types/analytics';

export async function getVisitCompletionTrends() {
  const response = await apiClient.get<AnalyticsPoint[]>('/analytics/visit-completion-trends');
  return response.data;
}

export async function getIssueAnalytics() {
  const response = await apiClient.get<AnalyticsPoint[]>('/analytics/issue-analytics');
  return response.data;
}
