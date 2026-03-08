'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptPortalWorkOrder,
  getPortalDashboard,
  getPortalSiteByCode,
  getPortalSites,
  getPortalSlaReport,
  getPortalVisitEvidence,
  getPortalVisits,
  getPortalWorkOrders,
  rejectPortalWorkOrder,
} from '@/services/portal.service';
import { PortalWorkOrderRejectPayload } from '@/types/portal';

export function usePortalDashboard(enabled = true) {
  return useQuery({
    queryKey: ['portal', 'dashboard'],
    queryFn: getPortalDashboard,
    enabled,
  });
}

export function usePortalSites(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'sites', page],
    queryFn: () => getPortalSites(page),
    enabled,
  });
}

export function usePortalSite(siteCode: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'sites', siteCode],
    queryFn: () => getPortalSiteByCode(siteCode!),
    enabled: enabled && Boolean(siteCode),
  });
}

export function usePortalWorkOrders(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'workorders', page],
    queryFn: () => getPortalWorkOrders(page),
    enabled,
  });
}

export function usePortalSlaReport(enabled = true) {
  return useQuery({
    queryKey: ['portal', 'sla-report'],
    queryFn: getPortalSlaReport,
    enabled,
  });
}

export function usePortalVisits(siteCode: string | undefined, page = 1, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'visits', siteCode, page],
    queryFn: () => getPortalVisits(siteCode!, page),
    enabled: enabled && Boolean(siteCode),
  });
}

export function usePortalVisitEvidence(visitId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'visits', visitId, 'evidence'],
    queryFn: () => getPortalVisitEvidence(visitId!),
    enabled: enabled && Boolean(visitId),
  });
}

export function useAcceptPortalWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptPortalWorkOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal', 'workorders'] });
    },
  });
}

export function useRejectPortalWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PortalWorkOrderRejectPayload }) =>
      rejectPortalWorkOrder(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal', 'workorders'] });
    },
  });
}
