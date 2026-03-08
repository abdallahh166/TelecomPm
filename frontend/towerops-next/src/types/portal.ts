export type PortalDashboard = {
  totalSites: number;
  onAirPercent: number;
  slaComplianceRatePercent: number;
  pendingCmCount: number;
  overdueBmCount: number;
};

export type PortalSite = {
  siteCode: string;
  name: string;
  status: string;
  region: string;
  lastVisitDate?: string | null;
  lastVisitType?: string | null;
  openWorkOrdersCount: number;
  breachedSlaCount: number;
};

export type PortalWorkOrder = {
  workOrderId: string;
  siteCode: string;
  status: string;
  priority: string;
  slaDeadline: string;
  createdAt: string;
  completedAt?: string | null;
};

export type PortalSlaMonthlyMetric = {
  year: number;
  month: number;
  slaClass: string;
  compliancePercent: number;
  breachCount: number;
  averageResponseMinutes: number;
};

export type PortalSlaReport = {
  monthly: PortalSlaMonthlyMetric[];
};

export type PortalVisit = {
  visitId: string;
  visitNumber: string;
  status: string;
  type: string;
  scheduledDate: string;
  engineerDisplayName: string;
};

export type PortalVisitPhotoEvidence = {
  photoId: string;
  type: string;
  category: string;
  itemName: string;
  fileName: string;
  capturedAtUtc?: string | null;
};

export type PortalVisitReadingEvidence = {
  readingId: string;
  readingType: string;
  category: string;
  value: number;
  unit: string;
  isWithinRange: boolean;
  measuredAtUtc: string;
};

export type PortalVisitChecklistEvidence = {
  checklistItemId: string;
  category: string;
  itemName: string;
  status: string;
  isMandatory: boolean;
  completedAtUtc?: string | null;
};

export type PortalVisitEvidence = {
  visitId: string;
  visitNumber: string;
  siteCode: string;
  visitType: string;
  visitStatus: string;
  scheduledDateUtc: string;
  photos: PortalVisitPhotoEvidence[];
  readings: PortalVisitReadingEvidence[];
  checklistItems: PortalVisitChecklistEvidence[];
};

export type PortalWorkOrderRejectPayload = {
  reason: string;
};
