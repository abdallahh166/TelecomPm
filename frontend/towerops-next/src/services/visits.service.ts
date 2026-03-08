import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import { VisitDetails, VisitListItem } from '@/types/visits';

export async function getScheduledVisits(params: {
  page?: number;
  pageSize?: number;
  engineerId?: string;
  date?: string;
}) {
  const response = await apiClient.get<PagedResponse<VisitListItem>>('/visits/scheduled', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      engineerId: params.engineerId,
      date: params.date,
    },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getVisitById(id: string) {
  const response = await apiClient.get<VisitDetails>(`/visits/${id}`);
  return response.data;
}

export async function startVisit(id: string) {
  await apiClient.patch(`/visits/${id}/start`);
}

export async function completeVisit(id: string) {
  await apiClient.patch(`/visits/${id}/complete`);
}

export async function cancelVisit(id: string) {
  await apiClient.patch(`/visits/${id}/cancel`);
}
