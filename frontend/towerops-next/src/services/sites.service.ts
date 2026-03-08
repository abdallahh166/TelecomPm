import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import {
  CreateSitePayload,
  ImportSiteDataResult,
  SiteImportKind,
  SiteDetail,
  SiteListItem,
  UpdateSitePayload,
} from '@/types/sites';

export async function getSitesByOffice(officeId: string, page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<SiteListItem>>(`/sites/office/${officeId}`, {
    params: { page, pageSize },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getSiteById(siteId: string) {
  const response = await apiClient.get<SiteDetail>(`/sites/${siteId}`);
  return response.data;
}

export async function createSite(payload: CreateSitePayload) {
  const response = await apiClient.post<SiteDetail>('/sites', payload);
  return response.data;
}

export async function updateSite(siteId: string, payload: UpdateSitePayload) {
  const response = await apiClient.put<SiteDetail>(`/sites/${siteId}`, payload);
  return response.data;
}

export async function importSites(file: File) {
  return importSiteData('sites', file);
}

const siteImportPathByKind: Record<SiteImportKind, string> = {
  sites: '/sites/import',
  'site-assets': '/sites/import/site-assets',
  'power-data': '/sites/import/power-data',
  'radio-data': '/sites/import/radio-data',
  'tx-data': '/sites/import/tx-data',
  'sharing-data': '/sites/import/sharing-data',
  'rf-status': '/sites/import/rf-status',
  'battery-discharge-tests': '/sites/import/battery-discharge-tests',
  'delta-sites': '/sites/import/delta-sites',
};

export async function importSiteData(kind: SiteImportKind, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ImportSiteDataResult>(siteImportPathByKind[kind], formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
