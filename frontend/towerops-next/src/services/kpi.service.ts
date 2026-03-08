import { apiClient } from '@/lib/api-client';
import { OperationsKpi } from '@/types/kpi';

export async function getOperationsKpi() {
  const response = await apiClient.get<OperationsKpi>('/kpi/operations');
  return response.data;
}
