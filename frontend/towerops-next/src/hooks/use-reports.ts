'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  downloadBdt,
  downloadChecklist,
  downloadDataCollection,
  downloadScorecard,
  getVisitReport,
} from '@/services/reports.service';
import {
  BdtReportFilters,
  ChecklistReportFilters,
  DataCollectionReportFilters,
  ScorecardReportFilters,
} from '@/types/reports';

export function useVisitReport(visitId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'visits', visitId],
    queryFn: () => getVisitReport(visitId!),
    enabled: enabled && Boolean(visitId),
  });
}

export function useDownloadScorecard() {
  return useMutation({
    mutationFn: (filters: ScorecardReportFilters) => downloadScorecard(filters),
  });
}

export function useDownloadChecklist() {
  return useMutation({
    mutationFn: (filters?: ChecklistReportFilters) => downloadChecklist(filters),
  });
}

export function useDownloadBdt() {
  return useMutation({
    mutationFn: (filters?: BdtReportFilters) => downloadBdt(filters),
  });
}

export function useDownloadDataCollection() {
  return useMutation({
    mutationFn: (filters?: DataCollectionReportFilters) => downloadDataCollection(filters),
  });
}
