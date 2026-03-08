import { apiClient } from '@/lib/api-client';
import {
  BdtReportFilters,
  ChecklistReportFilters,
  DataCollectionReportFilters,
  ScorecardReportFilters,
  VisitReport,
} from '@/types/reports';

export async function getVisitReport(visitId: string) {
  const response = await apiClient.get<VisitReport>(`/reports/visits/${visitId}`);
  return response.data;
}

export async function downloadScorecard(filters: ScorecardReportFilters) {
  const response = await apiClient.get<Blob>('/reports/scorecard', {
    params: {
      officeCode: filters.officeCode,
      month: filters.month,
      year: filters.year,
    },
    responseType: 'blob',
  });
  return response.data;
}

export async function downloadChecklist(filters?: ChecklistReportFilters) {
  const response = await apiClient.get<Blob>('/reports/checklist', {
    params: {
      visitId: filters?.visitId,
      visitType: filters?.visitType,
    },
    responseType: 'blob',
  });
  return response.data;
}

export async function downloadBdt(filters?: BdtReportFilters) {
  const response = await apiClient.get<Blob>('/reports/bdt', {
    params: {
      fromDateUtc: filters?.fromDateUtc,
      toDateUtc: filters?.toDateUtc,
    },
    responseType: 'blob',
  });
  return response.data;
}

export async function downloadDataCollection(filters?: DataCollectionReportFilters) {
  const response = await apiClient.get<Blob>('/reports/data-collection', {
    params: {
      officeCode: filters?.officeCode,
    },
    responseType: 'blob',
  });
  return response.data;
}
