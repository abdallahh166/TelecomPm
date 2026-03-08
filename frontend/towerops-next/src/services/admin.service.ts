import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import { OfficeItem, RoleItem, SettingItem, UserItem } from '@/types/admin';

export async function getUsers(page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<UserItem>>('/users/office/me', { params: { page, pageSize } });
  return { data: response.data.data, pagination: normalizePagination(response.data.pagination) };
}

export async function getOffices(page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<OfficeItem>>('/offices', { params: { page, pageSize } });
  return { data: response.data.data, pagination: normalizePagination(response.data.pagination) };
}

export async function getRoles(page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<RoleItem>>('/roles', { params: { page, pageSize } });
  return { data: response.data.data, pagination: normalizePagination(response.data.pagination) };
}

export async function getSettings(page = 1, pageSize = 20) {
  const response = await apiClient.get<PagedResponse<SettingItem>>('/settings', { params: { page, pageSize } });
  return { data: response.data.data, pagination: normalizePagination(response.data.pagination) };
}
