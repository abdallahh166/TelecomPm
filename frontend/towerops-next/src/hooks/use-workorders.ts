'use client';

import { useQuery } from '@tanstack/react-query';
import { getWorkOrderById, getWorkOrders } from '@/services/workorders.service';

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
