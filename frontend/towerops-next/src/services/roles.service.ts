import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import { ApplicationRole, CreateRolePayload, RoleListFilters, UpdateRolePayload } from '@/types/roles';

export async function getRoles(page = 1, filters?: RoleListFilters) {
  const response = await apiClient.get<PagedResponse<ApplicationRole>>('/roles', {
    params: {
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

export async function getRoleById(id: string) {
  const response = await apiClient.get<ApplicationRole>(`/roles/${id}`);
  return response.data;
}

export async function getRolePermissions() {
  const response = await apiClient.get<string[]>('/roles/permissions');
  return response.data;
}

export async function createRole(payload: CreateRolePayload) {
  const response = await apiClient.post<ApplicationRole>('/roles', payload);
  return response.data;
}

export async function updateRole(id: string, payload: UpdateRolePayload) {
  const response = await apiClient.put<ApplicationRole>(`/roles/${id}`, payload);
  return response.data;
}

export async function deleteRole(id: string) {
  await apiClient.delete(`/roles/${id}`);
}
