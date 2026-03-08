'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveEscalation,
  closeEscalation,
  createEscalation,
  getEscalationById,
  rejectEscalation,
  reviewEscalation,
} from '@/services/escalations.service';
import { CreateEscalationPayload } from '@/types/escalations';

export function useEscalation(id: string, enabled = true) {
  return useQuery({
    queryKey: ['escalations', id],
    queryFn: () => getEscalationById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateEscalation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEscalationPayload) => createEscalation(payload),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['escalations'] }),
        queryClient.invalidateQueries({ queryKey: ['escalations', result.id] }),
      ]);
    },
  });
}

function useEscalationAction(id: string, action: (escalationId: string) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => action(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['escalations'] }),
        queryClient.invalidateQueries({ queryKey: ['escalations', id] }),
      ]);
    },
  });
}

export function useReviewEscalation(id: string) {
  return useEscalationAction(id, reviewEscalation);
}

export function useApproveEscalation(id: string) {
  return useEscalationAction(id, approveEscalation);
}

export function useRejectEscalation(id: string) {
  return useEscalationAction(id, rejectEscalation);
}

export function useCloseEscalation(id: string) {
  return useEscalationAction(id, closeEscalation);
}
