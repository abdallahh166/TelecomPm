export type SiteListItem = {
  id: string;
  siteCode: string;
  siteName: string;
  officeName: string;
  status: string;
  ownershipType: string;
};

export type SiteCoordinates = {
  latitude: number;
  longitude: number;
};

export type SiteAddress = {
  street: string;
  city: string;
  region: string;
  details: string;
};

export type SiteDetail = {
  id: string;
  siteCode: string;
  legacyShortCode?: string | null;
  name: string;
  omcName: string;
  region: string;
  subRegion: string;
  siteType: string;
  complexity: string;
  status: string;
  towerOwnershipType: string;
  responsibilityScope: string;
  towerOwnerName?: string | null;
  hostContactName?: string | null;
  hostContactPhone?: string | null;
  externalContextNotes?: string | null;
  estimatedVisitDurationMinutes: number;
  lastVisitDate?: string | null;
  requiredPhotosCount: number;
  coordinates?: SiteCoordinates | null;
  address?: SiteAddress | null;
};

export type CreateSitePayload = {
  siteCode: string;
  name: string;
  omcName: string;
  officeId: string;
  region: string;
  subRegion: string;
  latitude: number;
  longitude: number;
  address: {
    street?: string;
    city: string;
    region: string;
    details?: string;
  };
  siteType: string;
  bscName?: string;
  bscCode?: string;
};

export type UpdateSitePayload = {
  name: string;
  omcName: string;
  bscName?: string;
  bscCode?: string;
  region?: string;
  subRegion?: string;
  siteType: string;
  subcontractor?: string;
  maintenanceArea?: string;
  status?: string;
  complexity?: string;
};

export type ImportSiteDataResult = {
  importedCount: number;
  skippedCount: number;
  errors: string[];
};

export type SiteImportKind =
  | 'sites'
  | 'site-assets'
  | 'power-data'
  | 'radio-data'
  | 'tx-data'
  | 'sharing-data'
  | 'rf-status'
  | 'battery-discharge-tests'
  | 'delta-sites';
