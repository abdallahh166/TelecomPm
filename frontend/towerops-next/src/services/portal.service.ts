import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import { PortalWorkOrder } from '@/types/portal';

export async function getPortalDashboard() {
  const response = await apiClient.get('/portal/dashboard');
  return response.data;
}

export async function getPortalWorkOrders(page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<PortalWorkOrder>>('/portal/workorders', {
    params: { page, pageSize, sortBy: 'createdAt', sortDir: 'desc' },
  });

  return { data: response.data.data, pagination: normalizePagination(response.data.pagination) };
}

export async function acceptPortalWorkOrder(id: string) {
  await apiClient.patch(`/portal/workorders/${id}/accept`);
}

export async function rejectPortalWorkOrder(id: string) {
  await apiClient.patch(`/portal/workorders/${id}/reject`);
}
