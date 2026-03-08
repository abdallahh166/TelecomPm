import { apiClient } from '@/lib/api-client';
import {
  AssignSiteToEngineerPayload,
  CreateDailyPlanPayload,
  DailyPlan,
  PlannedVisitStop,
  RemoveSiteFromEngineerPayload,
  UnassignedSite,
} from '@/types/daily-plans';

export async function getDailyPlan(officeId: string, date: string) {
  const response = await apiClient.get<DailyPlan>(`/daily-plans/${officeId}/${date}`);
  return response.data;
}

export async function createDailyPlan(payload: CreateDailyPlanPayload) {
  const response = await apiClient.post<DailyPlan>('/daily-plans', payload);
  return response.data;
}

export async function assignSiteToEngineer(planId: string, payload: AssignSiteToEngineerPayload) {
  const response = await apiClient.post<DailyPlan>(`/daily-plans/${planId}/assign`, payload);
  return response.data;
}

export async function removeSiteFromEngineer(planId: string, payload: RemoveSiteFromEngineerPayload) {
  const response = await apiClient.delete<DailyPlan>(`/daily-plans/${planId}/assign`, {
    data: payload,
  });
  return response.data;
}

export async function getSuggestedOrder(planId: string, engineerId: string) {
  const response = await apiClient.get<PlannedVisitStop[]>(`/daily-plans/${planId}/suggest/${engineerId}`);
  return response.data;
}

export async function getUnassignedSites(officeId: string, date: string) {
  const response = await apiClient.get<UnassignedSite[]>(`/daily-plans/${officeId}/${date}/unassigned`);
  return response.data;
}

export async function publishDailyPlan(planId: string) {
  const response = await apiClient.post<DailyPlan>(`/daily-plans/${planId}/publish`);
  return response.data;
}
