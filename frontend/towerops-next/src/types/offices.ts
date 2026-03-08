export type Office = {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string;
  totalSites: number;
  activeEngineers: number;
  isActive: boolean;
};

export type OfficeDetail = Office & {
  street: string;
  buildingNumber?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  activeTechnicians: number;
  createdAt: string;
  updatedAt?: string | null;
};

export type OfficeStatistics = {
  officeId: string;
  officeCode: string;
  officeName: string;
  region: string;
  totalSites: number;
  activeSites: number;
  totalEngineers: number;
  activeEngineers: number;
  totalTechnicians: number;
  activeTechnicians: number;
  scheduledVisits: number;
  totalMaterials: number;
  lowStockMaterials: number;
};

export type OfficeAddressPayload = {
  street?: string;
  city: string;
  region: string;
  details?: string;
};

export type CreateOfficePayload = {
  code: string;
  name: string;
  region: string;
  address: OfficeAddressPayload;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type UpdateOfficePayload = {
  name: string;
  region: string;
  address: OfficeAddressPayload;
  latitude?: number;
  longitude?: number;
};

export type UpdateOfficeContactPayload = {
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type OfficeListFilters = {
  onlyActive?: boolean;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};
