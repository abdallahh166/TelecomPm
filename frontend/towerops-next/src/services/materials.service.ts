import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import { MaterialItem } from '@/types/materials';

export async function getMaterials(page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<MaterialItem>>('/materials', {
    params: { page, pageSize },
  });
  return { data: response.data.data, pagination: normalizePagination(response.data.pagination) };
}
