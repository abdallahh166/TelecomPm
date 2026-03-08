import type { PaginationMetadata } from "../../core/http/apiTypes";
import { apiClient } from "../../core/http/apiClient";
import { buildQuery, defaultPagination } from "./common";

export type SiteDto = {
  id: string;
  siteCode: string;
  legacyShortCode?: string;
  name: string;
  omcName: string;
  region: string;
  subRegion: string;
  siteType: string;
  complexity: string;
  status: string;
  towerOwnershipType: string;
  responsibilityScope: string;
  towerOwnerName?: string;
  hostContactName?: string;
  hostContactPhone?: string;
  externalContextNotes?: string;
  estimatedVisitDurationMinutes: number;
  lastVisitDate?: string;
  requiredPhotosCount: number;
};

export type SiteDetailDto = SiteDto & {
  coordinates?: { latitude: number; longitude: number };
  address?: { street?: string; city: string; region: string; details?: string };
};

export type ImportSiteDataResult = {
  importedCount: number;
  skippedCount: number;
  errors: string[];
};

export type CreateSiteRequest = {
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

export type UpdateSiteRequest = {
  name?: string;
  omcName?: string;
  bscName?: string;
  bscCode?: string;
  region?: string;
  subRegion?: string;
  siteType?: string;
  subcontractor?: string;
  maintenanceArea?: string;
  status?: string;
  complexity?: string;
};

export type UpdateSiteOwnershipRequest = {
  towerOwnershipType: string;
  towerOwnerName?: string;
  sharingAgreementRef?: string;
  hostContactName?: string;
  hostContactPhone?: string;
};

export type SiteListQuery = {
  pageNumber?: number;
  pageSize?: number;
  complexity?: string;
  status?: string;
};

type SiteListResult = {
  items: SiteDto[];
  pagination: PaginationMetadata;
};

export type MaintenanceSitesQuery = {
  daysThreshold?: number;
  officeId?: string;
};

const SITE_IMPORT_ENDPOINTS = {
  default: "/sites/import",
  siteAssets: "/sites/import/site-assets",
  powerData: "/sites/import/power-data",
  radioData: "/sites/import/radio-data",
  txData: "/sites/import/tx-data",
  sharingData: "/sites/import/sharing-data",
  rfStatus: "/sites/import/rf-status",
  batteryDischargeTests: "/sites/import/battery-discharge-tests",
  deltaSites: "/sites/import/delta-sites",
} as const;

export type SiteImportType = keyof typeof SITE_IMPORT_ENDPOINTS;

export const sitesApi = {
  async listForOffice(officeId: string, query: SiteListQuery): Promise<SiteListResult> {
    const response = await apiClient.request<SiteDto[]>(
      `/sites/office/${officeId}${buildQuery({
        pageNumber: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 20,
        complexity: query.complexity,
        status: query.status,
      })}`,
    );

    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async listMaintenance(query: MaintenanceSitesQuery): Promise<SiteDto[]> {
    const response = await apiClient.request<SiteDto[]>(
      `/sites/maintenance${buildQuery({
        daysThreshold: query.daysThreshold ?? 30,
        officeId: query.officeId,
      })}`,
    );
    return response.data;
  },

  async getById(siteId: string): Promise<SiteDetailDto> {
    const response = await apiClient.request<SiteDetailDto>(`/sites/${siteId}`);
    return response.data;
  },

  async create(request: CreateSiteRequest): Promise<SiteDetailDto> {
    const response = await apiClient.request<SiteDetailDto>("/sites", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async update(siteId: string, request: UpdateSiteRequest): Promise<void> {
    await apiClient.request<void>(`/sites/${siteId}`, {
      method: "PUT",
      body: request,
    });
  },

  async updateStatus(siteId: string, status: string): Promise<void> {
    await apiClient.request<void>(`/sites/${siteId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  async assignEngineer(siteId: string, engineerId: string): Promise<void> {
    await apiClient.request<void>(`/sites/${siteId}/assign`, {
      method: "POST",
      body: { engineerId },
    });
  },

  async unassignEngineer(siteId: string): Promise<void> {
    await apiClient.request<void>(`/sites/${siteId}/unassign`, {
      method: "POST",
    });
  },

  async updateOwnership(siteCode: string, request: UpdateSiteOwnershipRequest): Promise<void> {
    await apiClient.request<void>(`/sites/${siteCode}/ownership`, {
      method: "PUT",
      body: request,
    });
  },

  async importData(file: File, importType: SiteImportType): Promise<ImportSiteDataResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.request<ImportSiteDataResult>(SITE_IMPORT_ENDPOINTS[importType], {
      method: "POST",
      body: formData,
    });
    return response.data;
  },
};
