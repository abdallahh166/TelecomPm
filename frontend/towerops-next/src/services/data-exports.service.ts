import { apiClient } from '@/lib/api-client';
import { DataExportRequest } from '@/types/data-exports';

export async function requestDataExport() {
  const response = await apiClient.post<DataExportRequest>('/data-exports/me');
  return response.data;
}

export async function getDataExportRequest(requestId: string) {
  const response = await apiClient.get<DataExportRequest>(`/data-exports/me/${requestId}`);
  return response.data;
}
