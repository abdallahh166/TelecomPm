import { apiClient } from "../../core/http/apiClient";

export const DAILY_PLAN_STATUS_OPTIONS = [
  "Draft",
  "Published",
  "InProgress",
  "Completed",
] as const;
export type DailyPlanStatus = (typeof DAILY_PLAN_STATUS_OPTIONS)[number];

export const DAILY_PLAN_VISIT_TYPE_OPTIONS = [
  "BM",
  "CM",
  "Emergency",
  "Inspection",
  "Installation",
  "Upgrade",
  "Commissioning",
  "Audit",
] as const;
export type DailyPlanVisitType = (typeof DAILY_PLAN_VISIT_TYPE_OPTIONS)[number];

export type PlannedVisitStopDto = {
  order: number;
  siteCode: string;
  latitude: number;
  longitude: number;
  visitType: DailyPlanVisitType;
  priority: string;
  distanceFromPreviousKm: number;
  estimatedTravelMinutes: number;
};

export type EngineerDayPlanDto = {
  engineerId: string;
  totalEstimatedDistanceKm: number;
  totalEstimatedTravelMinutes: number;
  stops: PlannedVisitStopDto[];
};

export type DailyPlanDto = {
  id: string;
  officeId: string;
  planDate: string;
  officeManagerId: string;
  status: DailyPlanStatus;
  engineerPlans: EngineerDayPlanDto[];
};

export type UnassignedSiteDto = {
  siteId: string;
  siteCode: string;
  name: string;
};

export type CreateDailyPlanRequest = {
  officeId: string;
  planDate: string;
  officeManagerId: string;
};

export type AssignSiteToEngineerRequest = {
  engineerId: string;
  siteCode: string;
  visitType: DailyPlanVisitType;
  priority: string;
};

export type RemoveSiteFromEngineerRequest = {
  engineerId: string;
  siteCode: string;
};

export const dailyPlansApi = {
  async create(request: CreateDailyPlanRequest): Promise<DailyPlanDto> {
    const response = await apiClient.request<DailyPlanDto>("/daily-plans", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async getByOfficeAndDate(officeId: string, date: string): Promise<DailyPlanDto> {
    const response = await apiClient.request<DailyPlanDto>(`/daily-plans/${officeId}/${date}`);
    return response.data;
  },

  async assignSite(planId: string, request: AssignSiteToEngineerRequest): Promise<DailyPlanDto> {
    const response = await apiClient.request<DailyPlanDto>(`/daily-plans/${planId}/assign`, {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async removeSite(planId: string, request: RemoveSiteFromEngineerRequest): Promise<DailyPlanDto> {
    const response = await apiClient.request<DailyPlanDto>(`/daily-plans/${planId}/assign`, {
      method: "DELETE",
      body: request,
    });
    return response.data;
  },

  async suggestOrder(planId: string, engineerId: string): Promise<PlannedVisitStopDto[]> {
    const response = await apiClient.request<PlannedVisitStopDto[]>(
      `/daily-plans/${planId}/suggest/${engineerId}`,
    );
    return response.data;
  },

  async getUnassignedSites(officeId: string, date: string): Promise<UnassignedSiteDto[]> {
    const response = await apiClient.request<UnassignedSiteDto[]>(
      `/daily-plans/${officeId}/${date}/unassigned`,
    );
    return response.data;
  },

  async publish(planId: string): Promise<DailyPlanDto> {
    const response = await apiClient.request<DailyPlanDto>(`/daily-plans/${planId}/publish`, {
      method: "POST",
    });
    return response.data;
  },
};

