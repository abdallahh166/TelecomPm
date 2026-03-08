'use client';

import { useQuery } from '@tanstack/react-query';
import { getOperationsKpi } from '@/services/kpi.service';
import { OperationsKpiFilters } from '@/types/kpi';

export function useOperationsKpi(filters?: OperationsKpiFilters, enabled = true) {
  return useQuery({
    queryKey: [
      'kpi',
      'operations',
      filters?.fromDateUtc,
      filters?.toDateUtc,
      filters?.officeCode,
      filters?.slaClass,
    ],
    queryFn: () => getOperationsKpi(filters),
    enabled,
  });
}
