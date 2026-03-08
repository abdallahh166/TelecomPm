export type TrendPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type VisitCompletionTrend = {
  period: string;
  totalVisits: number;
  completedVisits: number;
  approvedVisits: number;
  rejectedVisits: number;
  completionRate: number;
  approvalRate: number;
  overdueVisits: number;
};

export type IssueByCategory = {
  category: string;
  totalCount: number;
  openCount: number;
  resolvedCount: number;
};

export type IssueBySeverity = {
  severity: string;
  totalCount: number;
  openCount: number;
  resolvedCount: number;
};

export type IssueBySite = {
  siteId: string;
  siteCode: string;
  siteName: string;
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
};

export type IssueAnalyticsReport = {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  resolutionRate: number;
  averageResolutionTime: number;
  issuesByCategory: IssueByCategory[];
  issuesBySeverity: IssueBySeverity[];
  topSitesWithIssues: IssueBySite[];
  fromDate: string;
  toDate: string;
};

export type EngineerPerformanceReport = {
  engineerId: string;
  engineerName: string;
  engineerEmail: string;
  officeId: string;
  officeName: string;
  specializations: string[];
  assignedSitesCount: number;
  maxAssignedSites?: number | null;
  capacityUtilization: number;
  totalVisits: number;
  completedVisits: number;
  approvedVisits: number;
  rejectedVisits: number;
  pendingReviewVisits: number;
  onTimeVisits: number;
  overdueVisits: number;
  completionRate: number;
  approvalRate: number;
  onTimeRate: number;
  performanceRating?: number | null;
  visitsNeedingCorrection: number;
  criticalIssuesReported: number;
  averageVisitDuration: number;
  fromDate: string;
  toDate: string;
  completionRateChange?: number | null;
  approvalRateChange?: number | null;
};

export type SiteMaintenanceHistory = {
  visitDate: string;
  visitNumber: string;
  visitStatus: string;
  engineerName: string;
  issuesFound: number;
  issuesResolved: number;
  materialCost: number;
  notes?: string | null;
};

export type SiteMaintenanceReport = {
  siteId: string;
  siteCode: string;
  siteName: string;
  region: string;
  officeId: string;
  officeName: string;
  status: string;
  siteType: string;
  complexity: string;
  assignedEngineerId?: string | null;
  assignedEngineerName?: string | null;
  totalVisits: number;
  completedVisits: number;
  lastVisitDate?: string | null;
  nextScheduledVisit?: string | null;
  daysSinceLastVisit: number;
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
  resolvedIssues: number;
  maintenanceHistory: SiteMaintenanceHistory[];
  totalMaterialCost: number;
  materialsUsedCount: number;
  fromDate: string;
  toDate: string;
};

export type OfficeEngineerSummary = {
  engineerId: string;
  engineerName: string;
  assignedSites: number;
  completedVisits: number;
  completionRate: number;
  performanceRating?: number | null;
};

export type OfficeStatisticsReport = {
  officeId: string;
  officeCode: string;
  officeName: string;
  region: string;
  totalSites: number;
  activeSites: number;
  inactiveSites: number;
  assignedSites: number;
  unassignedSites: number;
  sitesNeedingMaintenance: number;
  totalEngineers: number;
  activeEngineers: number;
  totalTechnicians: number;
  activeTechnicians: number;
  totalUsers: number;
  totalVisits: number;
  scheduledVisits: number;
  completedVisits: number;
  approvedVisits: number;
  rejectedVisits: number;
  pendingReviewVisits: number;
  overdueVisits: number;
  totalMaterials: number;
  activeMaterials: number;
  lowStockMaterials: number;
  totalMaterialValue: number;
  averageVisitCompletionRate: number;
  averageVisitApprovalRate: number;
  averageEngineerPerformance: number;
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
  resolvedIssues: number;
  topEngineers: OfficeEngineerSummary[];
  fromDate: string;
  toDate: string;
};

export type MaterialUsageTrend = {
  period: string;
  consumed: number;
  purchased: number;
  averagePerVisit: number;
};

export type MaterialUsageBySite = {
  siteId: string;
  siteCode: string;
  siteName: string;
  quantityUsed: number;
  totalCost: number;
  visitCount: number;
};

export type MaterialUsageSummary = {
  materialId: string;
  materialCode: string;
  materialName: string;
  category: string;
  officeId: string;
  officeName: string;
  currentStock: number;
  unit: string;
  minimumStock: number;
  reorderQuantity: number;
  isLowStock: boolean;
  stockValue: number;
  totalConsumed: number;
  totalPurchased: number;
  totalTransferred: number;
  transactionCount: number;
  visitUsageCount: number;
  unitCost: number;
  currency: string;
  totalCost: number;
  averageCostPerVisit: number;
  supplier?: string | null;
  lastRestockDate?: string | null;
  daysSinceLastRestock: number;
  usageTrends: MaterialUsageTrend[];
  topUsageSites: MaterialUsageBySite[];
  fromDate: string;
  toDate: string;
};

export type AnalyticsFilters = {
  fromDate?: string;
  toDate?: string;
};
