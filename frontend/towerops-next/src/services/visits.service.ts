import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import { VisitListItem } from '@/types/visits';

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
