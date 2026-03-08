import { apiClient } from '@/lib/api-client';
import {
  Asset,
  MarkAssetFaultyPayload,
  RecordAssetServicePayload,
  ReplaceAssetPayload,
} from '@/types/assets';

export async function getAssetsBySite(siteCode: string) {
  const response = await apiClient.get<Asset[]>(`/assets/site/${encodeURIComponent(siteCode)}`);
  return response.data;
}

export async function getFaultyAssets() {
  const response = await apiClient.get<Asset[]>('/assets/faulty');
  return response.data;
}

export async function getExpiringWarrantyAssets(days = 30) {
  const response = await apiClient.get<Asset[]>('/assets/expiring-warranties', {
    params: { days },
  });
  return response.data;
}

export async function getAssetByCode(assetCode: string) {
  const response = await apiClient.get<Asset>(`/assets/${encodeURIComponent(assetCode)}`);
  return response.data;
}

export async function getAssetHistory(assetCode: string) {
  const response = await apiClient.get<Asset>(`/assets/${encodeURIComponent(assetCode)}/history`);
  return response.data;
}

export async function recordAssetService(assetCode: string, payload: RecordAssetServicePayload) {
  const response = await apiClient.put<Asset>(`/assets/${encodeURIComponent(assetCode)}/service`, payload);
  return response.data;
}

export async function markAssetFaulty(assetCode: string, payload: MarkAssetFaultyPayload) {
  const response = await apiClient.put<Asset>(`/assets/${encodeURIComponent(assetCode)}/fault`, payload);
  return response.data;
}

export async function replaceAsset(assetCode: string, payload: ReplaceAssetPayload) {
  const response = await apiClient.put<Asset>(`/assets/${encodeURIComponent(assetCode)}/replace`, payload);
  return response.data;
}
