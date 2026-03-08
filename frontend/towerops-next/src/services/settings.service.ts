import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import {
  SettingsListFilters,
  SettingsTestResult,
  SettingsTestService,
  SystemSetting,
  UpsertSystemSettingPayload,
} from '@/types/settings';

export async function getSettings(page = 1, filters?: SettingsListFilters) {
  const response = await apiClient.get<PagedResponse<SystemSetting>>('/settings', {
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

export async function getSettingsByGroup(group: string) {
  const response = await apiClient.get<SystemSetting[]>(`/settings/${group}`);
  return response.data;
}

export async function upsertSettings(payload: UpsertSystemSettingPayload[]) {
  await apiClient.put('/settings', payload);
}

export async function testSettingsService(service: SettingsTestService) {
  const response = await apiClient.post<SettingsTestResult>(`/settings/test/${service}`);
  return response.data;
}
