export type VisitReport = {
  visit: {
    id?: string;
    visitNumber?: string;
    status?: string;
    type?: string;
    scheduledDate?: string;
    completionPercentage?: number;
    [key: string]: unknown;
  };
  site: {
    id?: string;
    siteCode?: string;
    siteName?: string;
    status?: string;
    [key: string]: unknown;
  };
  photoComparisons: Array<{
    itemName: string;
    beforePhotoUrl: string;
    afterPhotoUrl: string;
    beforeDescription?: string | null;
    afterDescription?: string | null;
  }>;
  totalMaterialCost: number;
};

export type ScorecardReportFilters = {
  officeCode: string;
  month: number;
  year: number;
};

export type ChecklistReportFilters = {
  visitId?: string;
  visitType?: string;
};

export type BdtReportFilters = {
  fromDateUtc?: string;
  toDateUtc?: string;
};

export type DataCollectionReportFilters = {
  officeCode?: string;
};
