import { apiClient } from '@/lib/api-client';
import { PagedResponse } from '@/types/api';
import { WorkOrderDetails, WorkOrderListItem } from '@/types/workorders';

export async function getWorkOrders(page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<WorkOrderListItem>>('/portal/workorders', {
    params: { page, pageSize, sortBy: 'createdAt', sortDir: 'desc' },
  });
  return response.data;
}

export async function getWorkOrderById(id: string) {
  const response = await apiClient.get<WorkOrderDetails>(`/workorders/${id}`);
  return response.data;
}
