'use client';

import { useQuery } from '@tanstack/react-query';
import { getDailyPlanByOffice } from '@/services/daily-plans.service';

export function useDailyPlans(officeId: string, date: string) {
  return useQuery({
    queryKey: ['daily-plans', officeId, date],
    queryFn: () => getDailyPlanByOffice(officeId, date),
    enabled: Boolean(officeId && date),
  });
}
