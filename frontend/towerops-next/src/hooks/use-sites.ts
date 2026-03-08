'use client';

import { useQuery } from '@tanstack/react-query';
import { getSitesByOffice } from '@/services/sites.service';

export function useSites(officeId: string, page = 1) {
  return useQuery({
    queryKey: ['sites', officeId, page],
    queryFn: () => getSitesByOffice(officeId, page),
    enabled: Boolean(officeId),
  });
}
