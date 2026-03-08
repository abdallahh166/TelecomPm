import { apiClient } from '@/lib/api-client';
import { SyncBatchRequest, SyncBatchResult, SyncConflict, SyncStatus } from '@/types/sync';

export async function getSyncStatus(deviceId: string) {
  const response = await apiClient.get<SyncStatus>(`/sync/status/${deviceId}`);
  return response.data;
}

export async function getSyncConflicts(engineerId: string) {
  const response = await apiClient.get<SyncConflict[]>(`/sync/conflicts/${engineerId}`);
  return response.data;
}

export async function processSyncBatch(payload: SyncBatchRequest) {
  const response = await apiClient.post<SyncBatchResult>('/sync', payload);
  return response.data;
}
