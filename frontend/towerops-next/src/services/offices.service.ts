import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import {
  CreateOfficePayload,
  Office,
  OfficeDetail,
  OfficeListFilters,
  OfficeStatistics,
  UpdateOfficeContactPayload,
  UpdateOfficePayload,
} from '@/types/offices';

export async function getOffices(page = 1, filters?: OfficeListFilters) {
  const response = await apiClient.get<PagedResponse<Office>>('/offices', {
    params: {
      onlyActive: filters?.onlyActive,
      page,
      pageSize: filters?.pageSize ?? 10,
      sortBy: filters?.sortBy,
      sortDir: filters?.sortDir,
    },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getOfficeById(officeId: string) {
  const response = await apiClient.get<OfficeDetail>(`/offices/${officeId}`);
  return response.data;
}

export async function getOfficesByRegion(region: string) {
  const response = await apiClient.get<Office[]>(`/offices/region/${region}`);
  return response.data;
}

export async function getOfficeStatistics(officeId: string) {
  const response = await apiClient.get<OfficeStatistics>(`/offices/${officeId}/statistics`);
  return response.data;
}

export async function createOffice(payload: CreateOfficePayload) {
  const response = await apiClient.post<OfficeDetail>('/offices', payload);
  return response.data;
}

export async function updateOffice(officeId: string, payload: UpdateOfficePayload) {
  const response = await apiClient.put<OfficeDetail>(`/offices/${officeId}`, payload);
  return response.data;
}

export async function updateOfficeContact(officeId: string, payload: UpdateOfficeContactPayload) {
  const response = await apiClient.patch<OfficeDetail>(`/offices/${officeId}/contact`, payload);
  return response.data;
}

export async function deleteOffice(officeId: string) {
  await apiClient.delete(`/offices/${officeId}`);
}
