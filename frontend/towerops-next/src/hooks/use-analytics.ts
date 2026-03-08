'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getEngineerPerformance,
  getIssueAnalytics,
  getMaterialUsage,
  getOfficeStatistics,
  getSiteMaintenance,
  getVisitCompletionTrends,
} from '@/services/analytics.service';
import { TrendPeriod } from '@/types/analytics';

type DateRange = {
  fromDate?: string;
  toDate?: string;
};

export function useEngineerPerformance(engineerId: string | undefined, filters?: DateRange, enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'engineer-performance', engineerId, filters?.fromDate, filters?.toDate],
    queryFn: () => getEngineerPerformance(engineerId!, filters),
    enabled: enabled && Boolean(engineerId),
  });
}

export function useSiteMaintenance(siteId: string | undefined, filters?: DateRange, enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'site-maintenance', siteId, filters?.fromDate, filters?.toDate],
    queryFn: () => getSiteMaintenance(siteId!, filters),
    enabled: enabled && Boolean(siteId),
  });
}

export function useOfficeStatistics(officeId: string | undefined, filters?: DateRange, enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'office-statistics', officeId, filters?.fromDate, filters?.toDate],
    queryFn: () => getOfficeStatistics(officeId!, filters),
    enabled: enabled && Boolean(officeId),
  });
}

export function useMaterialUsage(materialId: string | undefined, filters?: DateRange, enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'material-usage', materialId, filters?.fromDate, filters?.toDate],
    queryFn: () => getMaterialUsage(materialId!, filters),
    enabled: enabled && Boolean(materialId),
  });
}

export function useVisitCompletionTrends(
  filters?: {
    officeId?: string;
    engineerId?: string;
    fromDate?: string;
    toDate?: string;
    period?: TrendPeriod;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: [
      'analytics',
      'visit-completion-trends',
      filters?.officeId,
      filters?.engineerId,
      filters?.fromDate,
      filters?.toDate,
      filters?.period,
    ],
    queryFn: () => getVisitCompletionTrends(filters),
    enabled,
  });
}

export function useIssueAnalytics(
  filters?: {
    officeId?: string;
    siteId?: string;
    fromDate?: string;
    toDate?: string;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: [
      'analytics',
      'issue-analytics',
      filters?.officeId,
      filters?.siteId,
      filters?.fromDate,
      filters?.toDate,
    ],
    queryFn: () => getIssueAnalytics(filters),
    enabled,
  });
}
