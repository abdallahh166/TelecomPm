'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelVisit,
  completeVisit,
  getScheduledVisits,
  getVisitById,
  startVisit,
} from '@/services/visits.service';

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

export function useVisit(id: string) {
  return useQuery({
    queryKey: ['visits', id],
    queryFn: () => getVisitById(id),
    enabled: Boolean(id),
  });
}

export function useVisitLifecycleActions(id: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['visits'] }),
      queryClient.invalidateQueries({ queryKey: ['visits', id] }),
      queryClient.invalidateQueries({ queryKey: ['daily-plans'] }),
    ]);
  };

  const start = useMutation({ mutationFn: () => startVisit(id), onSuccess: invalidate });
  const complete = useMutation({ mutationFn: () => completeVisit(id), onSuccess: invalidate });
  const cancel = useMutation({ mutationFn: () => cancelVisit(id), onSuccess: invalidate });

  return { start, complete, cancel };
}
