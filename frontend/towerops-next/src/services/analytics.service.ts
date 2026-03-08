import { apiClient } from '@/lib/api-client';
import {
  EngineerPerformanceReport,
  IssueAnalyticsReport,
  MaterialUsageSummary,
  OfficeStatisticsReport,
  SiteMaintenanceReport,
  TrendPeriod,
  VisitCompletionTrend,
} from '@/types/analytics';

type DateRange = {
  fromDate?: string;
  toDate?: string;
};

export async function getEngineerPerformance(engineerId: string, filters?: DateRange) {
  const response = await apiClient.get<EngineerPerformanceReport>(`/analytics/engineer-performance/${engineerId}`, {
    params: {
      fromDate: filters?.fromDate,
      toDate: filters?.toDate,
    },
  });
  return response.data;
}

export async function getSiteMaintenance(siteId: string, filters?: DateRange) {
  const response = await apiClient.get<SiteMaintenanceReport>(`/analytics/site-maintenance/${siteId}`, {
    params: {
      fromDate: filters?.fromDate,
      toDate: filters?.toDate,
    },
  });
  return response.data;
}

export async function getOfficeStatistics(officeId: string, filters?: DateRange) {
  const response = await apiClient.get<OfficeStatisticsReport>(`/analytics/office-statistics/${officeId}`, {
    params: {
      fromDate: filters?.fromDate,
      toDate: filters?.toDate,
    },
  });
  return response.data;
}

export async function getMaterialUsage(materialId: string, filters?: DateRange) {
  const response = await apiClient.get<MaterialUsageSummary>(`/analytics/material-usage/${materialId}`, {
    params: {
      fromDate: filters?.fromDate,
      toDate: filters?.toDate,
    },
  });
  return response.data;
}

export async function getVisitCompletionTrends(filters?: {
  officeId?: string;
  engineerId?: string;
  fromDate?: string;
  toDate?: string;
  period?: TrendPeriod;
}) {
  const response = await apiClient.get<VisitCompletionTrend[]>('/analytics/visit-completion-trends', {
    params: {
      officeId: filters?.officeId,
      engineerId: filters?.engineerId,
      fromDate: filters?.fromDate,
      toDate: filters?.toDate,
      period: filters?.period,
    },
  });
  return response.data;
}

export async function getIssueAnalytics(filters?: {
  officeId?: string;
  siteId?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const response = await apiClient.get<IssueAnalyticsReport>('/analytics/issue-analytics', {
    params: {
      officeId: filters?.officeId,
      siteId: filters?.siteId,
      fromDate: filters?.fromDate,
      toDate: filters?.toDate,
    },
  });
  return response.data;
}
