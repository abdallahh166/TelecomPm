import { apiClient } from '@/lib/api-client';
import { AssetListItem } from '@/types/assets';

export async function getFaultyAssets() {
  const response = await apiClient.get<AssetListItem[]>('/assets/faulty');
  return response.data;
}

export async function getExpiringWarranties() {
  const response = await apiClient.get<AssetListItem[]>('/assets/expiring-warranties');
  return response.data;
}
