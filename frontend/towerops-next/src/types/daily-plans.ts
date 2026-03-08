export type DailyPlanStatus = 'Draft' | 'Published' | 'InProgress' | 'Completed';

export type VisitType =
  | 'BM'
  | 'CM'
  | 'Emergency'
  | 'Installation'
  | 'Upgrade'
  | 'Inspection'
  | 'Commissioning'
  | 'Audit';

export type PlannedVisitStop = {
  order: number;
  siteCode: string;
  latitude: number;
  longitude: number;
  visitType: VisitType;
  priority: string;
  distanceFromPreviousKm: number;
  estimatedTravelMinutes: number;
};

export type EngineerDayPlan = {
  engineerId: string;
  totalEstimatedDistanceKm: number;
  totalEstimatedTravelMinutes: number;
  stops: PlannedVisitStop[];
};

export type DailyPlan = {
  id: string;
  officeId: string;
  planDate: string;
  officeManagerId: string;
  status: DailyPlanStatus;
  engineerPlans: EngineerDayPlan[];
};

export type UnassignedSite = {
  siteId: string;
  siteCode: string;
  name: string;
};

export type CreateDailyPlanPayload = {
  officeId: string;
  planDate: string;
  officeManagerId: string;
};

export type AssignSiteToEngineerPayload = {
  engineerId: string;
  siteCode: string;
  visitType: VisitType;
  priority: string;
};

export type RemoveSiteFromEngineerPayload = {
  engineerId: string;
  siteCode: string;
};
