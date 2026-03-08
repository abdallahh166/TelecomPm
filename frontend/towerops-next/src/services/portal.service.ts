import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import {
  PortalDashboard,
  PortalSite,
  PortalSlaReport,
  PortalVisit,
  PortalVisitEvidence,
  PortalWorkOrder,
  PortalWorkOrderRejectPayload,
} from '@/types/portal';

export async function getPortalDashboard() {
  const response = await apiClient.get<PortalDashboard>('/portal/dashboard');
  return response.data;
}

export async function getPortalSites(page = 1, pageSize = 10, sortBy = 'siteCode', sortDir: 'asc' | 'desc' = 'desc') {
  const response = await apiClient.get<PagedResponse<PortalSite>>('/portal/sites', {
    params: { page, pageSize, sortBy, sortDir },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getPortalSiteByCode(siteCode: string) {
  const response = await apiClient.get<PortalSite>(`/portal/sites/${encodeURIComponent(siteCode)}`);
  return response.data;
}

export async function getPortalWorkOrders(
  page = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDir: 'asc' | 'desc' = 'desc',
) {
  const response = await apiClient.get<PagedResponse<PortalWorkOrder>>('/portal/workorders', {
    params: { page, pageSize, sortBy, sortDir },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function acceptPortalWorkOrder(id: string) {
  await apiClient.patch(`/portal/workorders/${id}/accept`);
}

export async function rejectPortalWorkOrder(id: string, payload: PortalWorkOrderRejectPayload) {
  await apiClient.patch(`/portal/workorders/${id}/reject`, payload);
}

export async function getPortalSlaReport() {
  const response = await apiClient.get<PortalSlaReport>('/portal/sla-report');
  return response.data;
}

export async function getPortalVisits(
  siteCode: string,
  page = 1,
  pageSize = 10,
  sortBy = 'scheduledDate',
  sortDir: 'asc' | 'desc' = 'desc',
) {
  const response = await apiClient.get<PagedResponse<PortalVisit>>(`/portal/visits/${encodeURIComponent(siteCode)}`, {
    params: { page, pageSize, sortBy, sortDir },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getPortalVisitEvidence(visitId: string) {
  const response = await apiClient.get<PortalVisitEvidence>(`/portal/visits/${visitId}/evidence`);
  return response.data;
}
