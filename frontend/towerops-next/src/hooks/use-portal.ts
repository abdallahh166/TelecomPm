'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptPortalWorkOrder,
  getPortalDashboard,
  getPortalWorkOrders,
  rejectPortalWorkOrder,
} from '@/services/portal.service';

export function usePortalDashboard() {
  return useQuery({ queryKey: ['portal', 'dashboard'], queryFn: getPortalDashboard });
}

export function usePortalWorkOrders(page: number) {
  return useQuery({ queryKey: ['portal', 'workorders', page], queryFn: () => getPortalWorkOrders(page) });
}

export function usePortalWorkOrderActions() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['portal', 'workorders'] });
  };

  const accept = useMutation({ mutationFn: acceptPortalWorkOrder, onSuccess: invalidate });
  const reject = useMutation({ mutationFn: rejectPortalWorkOrder, onSuccess: invalidate });

  return { accept, reject };
}
