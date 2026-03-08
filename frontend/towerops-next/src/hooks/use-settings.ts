'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSettings,
  getSettingsByGroup,
  testSettingsService,
  upsertSettings,
} from '@/services/settings.service';
import { SettingsListFilters, SettingsTestService, UpsertSystemSettingPayload } from '@/types/settings';

export function useSettings(page = 1, filters?: SettingsListFilters, enabled = true) {
  return useQuery({
    queryKey: ['settings', page, filters?.pageSize, filters?.sortBy, filters?.sortDir],
    queryFn: () => getSettings(page, filters),
    enabled,
  });
}

export function useSettingsByGroup(group: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['settings', 'group', group],
    queryFn: () => getSettingsByGroup(group!),
    enabled: enabled && Boolean(group),
  });
}

export function useUpsertSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertSystemSettingPayload[]) => upsertSettings(payload),
    onSuccess: async (_result, payload) => {
      const groups = Array.from(new Set(payload.map((item) => item.group)));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings'] }),
        ...groups.map((group) => queryClient.invalidateQueries({ queryKey: ['settings', 'group', group] })),
      ]);
    },
  });
}

export function useTestSettingsService() {
  return useMutation({
    mutationFn: (service: SettingsTestService) => testSettingsService(service),
  });
}
