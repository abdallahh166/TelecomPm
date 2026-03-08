'use client';

import { useQuery } from '@tanstack/react-query';
import { getPortalDashboard, getPortalWorkOrders } from '@/services/portal.service';

export function usePortalDashboard() {
  return useQuery({ queryKey: ['portal', 'dashboard'], queryFn: getPortalDashboard });
}

export function usePortalWorkOrders(page: number) {
  return useQuery({ queryKey: ['portal', 'workorders', page], queryFn: () => getPortalWorkOrders(page) });
}
