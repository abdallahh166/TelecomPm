export type VisitListItem = {
  id: string;
  visitNumber: string;
  siteCode: string;
  siteName: string;
  engineerName: string;
  scheduledDate: string;
  status: string;
  type: string;
};

export type VisitDetails = {
  id: string;
  visitNumber: string;
  siteCode: string;
  siteName: string;
  engineerName: string;
  scheduledDate: string;
  status: string;
  type: string;
  notes?: string;
};
