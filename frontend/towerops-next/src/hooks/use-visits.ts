'use client';

import { useQuery } from '@tanstack/react-query';
import { getScheduledVisits } from '@/services/visits.service';

export function useScheduledVisits(filters: {
  page: number;
  pageSize?: number;
  engineerId?: string;
  date?: string;
}) {
  return useQuery({
    queryKey: ['visits', 'scheduled', filters],
    queryFn: () => getScheduledVisits(filters),
  });
}
