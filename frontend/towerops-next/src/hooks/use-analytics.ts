'use client';

import { useQuery } from '@tanstack/react-query';
import { getIssueAnalytics, getVisitCompletionTrends } from '@/services/analytics.service';

export function useVisitCompletionTrends() {
  return useQuery({ queryKey: ['analytics', 'visit-trends'], queryFn: getVisitCompletionTrends });
}

export function useIssueAnalytics() {
  return useQuery({ queryKey: ['analytics', 'issue'], queryFn: getIssueAnalytics });
}
