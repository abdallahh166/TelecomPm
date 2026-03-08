import { apiClient } from '@/lib/api-client';
import { SyncConflictItem, SyncStatusItem } from '@/types/sync';

export async function getSyncStatus(deviceId: string) {
  const response = await apiClient.get<SyncStatusItem>(`/sync/status/${deviceId}`);
  return response.data;
}

export async function getSyncConflicts(engineerId: string) {
  const response = await apiClient.get<SyncConflictItem[]>(`/sync/conflicts/${engineerId}`);
  return response.data;
}
