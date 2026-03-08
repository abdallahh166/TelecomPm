import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import { SiteListItem } from '@/types/sites';

export async function getSitesByOffice(officeId: string, page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<SiteListItem>>(`/sites/office/${officeId}`, {
    params: { page, pageSize },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}
