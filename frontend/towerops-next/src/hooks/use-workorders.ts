'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelWorkOrder,
  closeWorkOrder,
  completeWorkOrder,
  getWorkOrderById,
  getWorkOrders,
  startWorkOrder,
} from '@/services/workorders.service';

export function useWorkOrders(page = 1) {
  return useQuery({
    queryKey: ['workorders', page],
    queryFn: () => getWorkOrders(page),
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['workorders', id],
    queryFn: () => getWorkOrderById(id),
    enabled: Boolean(id),
  });
}

export function useWorkOrderLifecycleActions(id: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['workorders'] }),
      queryClient.invalidateQueries({ queryKey: ['workorders', id] }),
      queryClient.invalidateQueries({ queryKey: ['portal', 'workorders'] }),
    ]);
  };

  const start = useMutation({ mutationFn: () => startWorkOrder(id), onSuccess: invalidate });
  const complete = useMutation({ mutationFn: () => completeWorkOrder(id), onSuccess: invalidate });
  const close = useMutation({ mutationFn: () => closeWorkOrder(id), onSuccess: invalidate });
  const cancel = useMutation({ mutationFn: () => cancelWorkOrder(id), onSuccess: invalidate });

  return { start, complete, close, cancel };
}
