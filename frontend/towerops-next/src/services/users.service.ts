import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import {
  ChangeUserRolePayload,
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserDetail,
  UserListFilters,
  UserPerformance,
  UserRoleFilters,
} from '@/types/users';

export async function getUsersByOffice(officeId: string, page = 1, filters?: UserListFilters) {
  const response = await apiClient.get<PagedResponse<User>>(`/users/office/${officeId}`, {
    params: {
      onlyActive: filters?.onlyActive,
      page,
      pageSize: filters?.pageSize ?? 10,
    },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getUsersByRole(role: string, page = 1, filters?: UserRoleFilters) {
  const response = await apiClient.get<PagedResponse<User>>(`/users/role/${role}`, {
    params: {
      officeId: filters?.officeId,
      page,
      pageSize: filters?.pageSize ?? 10,
    },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getUserById(userId: string) {
  const response = await apiClient.get<UserDetail>(`/users/${userId}`);
  return response.data;
}

export async function createUser(payload: CreateUserPayload) {
  const response = await apiClient.post<UserDetail>('/users', payload);
  return response.data;
}

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  const response = await apiClient.put<UserDetail>(`/users/${userId}`, payload);
  return response.data;
}

export async function deleteUser(userId: string) {
  await apiClient.delete(`/users/${userId}`);
}

export async function changeUserRole(userId: string, payload: ChangeUserRolePayload) {
  const response = await apiClient.patch<UserDetail>(`/users/${userId}/role`, payload);
  return response.data;
}

export async function activateUser(userId: string) {
  const response = await apiClient.patch<UserDetail>(`/users/${userId}/activate`);
  return response.data;
}

export async function deactivateUser(userId: string) {
  const response = await apiClient.patch<UserDetail>(`/users/${userId}/deactivate`);
  return response.data;
}

export async function unlockUserAccount(userId: string) {
  const response = await apiClient.patch<UserDetail>(`/users/${userId}/unlock-account`);
  return response.data;
}

export async function getUserPerformance(userId: string, fromDate?: string, toDate?: string) {
  const response = await apiClient.get<UserPerformance>(`/users/${userId}/performance`, {
    params: {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    },
  });
  return response.data;
}
