import { apiClient } from '@/lib/api-client';
import { DailyPlanItem } from '@/types/daily-plans';

export async function getDailyPlanByOffice(officeId: string, date: string) {
  const response = await apiClient.get<DailyPlanItem[]>(`/daily-plans/${officeId}/${date}`);
  return response.data;
}
