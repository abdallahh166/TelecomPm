export type OperationsKpiDashboard = {
  generatedAtUtc: string;
  fromDateUtc?: string | null;
  toDateUtc?: string | null;
  officeCode?: string | null;
  slaClass?: string | null;
  totalWorkOrders: number;
  openWorkOrders: number;
  breachedWorkOrders: number;
  atRiskWorkOrders: number;
  slaCompliancePercentage: number;
  totalReviewedVisits: number;
  ftfRatePercent: number;
  mttrHours: number;
  reopenRatePercent: number;
  evidenceCompletenessPercent: number;
  firstTimeFixPercentage: number;
  reopenRatePercentage: number;
  evidenceCompletenessPercentage: number;
  meanTimeToRepairHours: number;
};

export type OperationsKpiFilters = {
  fromDateUtc?: string;
  toDateUtc?: string;
  officeCode?: string;
  slaClass?: 'P1' | 'P2' | 'P3' | 'P4';
};
