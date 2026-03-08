import { apiClient } from '@/lib/api-client';
import { UserDataExportRequest } from '@/types/privacy';

export async function requestMyOperationalDataExport() {
  const response = await apiClient.post<UserDataExportRequest>('/data-exports/me');
  return response.data;
}

export async function downloadMyOperationalDataExport(requestId: string) {
  const response = await apiClient.get<Blob>(`/data-exports/me/${requestId}`, {
    responseType: 'blob',
  });
  return response.data;
}
