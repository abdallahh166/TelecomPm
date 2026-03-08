import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import { WorkOrderDetails, WorkOrderListItem } from '@/types/workorders';

export async function getWorkOrders(page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<WorkOrderListItem>>('/workorders', {
    params: { page, pageSize, sortBy: 'createdAt', sortDir: 'desc' },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getWorkOrderById(id: string) {
  const response = await apiClient.get<WorkOrderDetails>(`/workorders/${id}`);
  return response.data;
}

export async function startWorkOrder(id: string) {
  await apiClient.patch(`/workorders/${id}/start`);
}

export async function completeWorkOrder(id: string) {
  await apiClient.patch(`/workorders/${id}/complete`);
}

export async function closeWorkOrder(id: string) {
  await apiClient.patch(`/workorders/${id}/close`);
}

export async function cancelWorkOrder(id: string) {
  await apiClient.patch(`/workorders/${id}/cancel`);
}
