import { apiClient } from "../../core/http/apiClient";

export type AssetServiceRecordDto = {
  id: string;
  servicedAtUtc: string;
  serviceType: string;
  engineerId?: string;
  notes?: string;
  visitId?: string;
};

export type AssetDto = {
  id: string;
  assetCode: string;
  siteCode: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  installedAtUtc: string;
  warrantyExpiresAtUtc?: string;
  lastServicedAtUtc?: string;
  replacedAtUtc?: string;
  replacedByAssetId?: string;
  serviceHistory: AssetServiceRecordDto[];
};

export type RegisterAssetRequest = {
  siteCode: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  installedAtUtc: string;
  warrantyExpiresAtUtc?: string;
};

export type RecordAssetServiceRequest = {
  serviceType: string;
  engineerId?: string;
  visitId?: string;
  notes?: string;
};

export type MarkAssetFaultyRequest = {
  reason?: string;
  engineerId?: string;
};

export type ReplaceAssetRequest = {
  newAssetId: string;
};

export const assetsApi = {
  async listBySite(siteCode: string): Promise<AssetDto[]> {
    const response = await apiClient.request<AssetDto[]>(`/assets/site/${siteCode}`);
    return response.data;
  },

  async getByCode(assetCode: string): Promise<AssetDto> {
    const response = await apiClient.request<AssetDto>(`/assets/${assetCode}`);
    return response.data;
  },

  async getHistory(assetCode: string): Promise<AssetDto> {
    const response = await apiClient.request<AssetDto>(`/assets/${assetCode}/history`);
    return response.data;
  },

  async register(request: RegisterAssetRequest): Promise<AssetDto> {
    const response = await apiClient.request<AssetDto>("/assets", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async recordService(assetCode: string, request: RecordAssetServiceRequest): Promise<void> {
    await apiClient.request<void>(`/assets/${assetCode}/service`, {
      method: "PUT",
      body: request,
    });
  },

  async markFault(assetCode: string, request: MarkAssetFaultyRequest): Promise<void> {
    await apiClient.request<void>(`/assets/${assetCode}/fault`, {
      method: "PUT",
      body: request,
    });
  },

  async replace(assetCode: string, request: ReplaceAssetRequest): Promise<void> {
    await apiClient.request<void>(`/assets/${assetCode}/replace`, {
      method: "PUT",
      body: request,
    });
  },

  async listExpiringWarranties(days = 30): Promise<AssetDto[]> {
    const response = await apiClient.request<AssetDto[]>(`/assets/expiring-warranties?days=${days}`);
    return response.data;
  },

  async listFaulty(): Promise<AssetDto[]> {
    const response = await apiClient.request<AssetDto[]>("/assets/faulty");
    return response.data;
  },
};
