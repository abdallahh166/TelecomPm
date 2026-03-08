import { apiClient } from '@/lib/api-client';
import { EscalationItem } from '@/types/escalations';

export async function getEscalations() {
  const response = await apiClient.get<EscalationItem[]>('/escalations');
  return response.data;
}
