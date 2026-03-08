'use client';

import { useQuery } from '@tanstack/react-query';
import { getOperationsKpi } from '@/services/kpi.service';

export function useOperationsKpi() {
  return useQuery({
    queryKey: ['kpi', 'operations'],
    queryFn: getOperationsKpi,
  });
}
