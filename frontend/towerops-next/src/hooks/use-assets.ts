'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAssetByCode,
  getAssetHistory,
  getAssetsBySite,
  getExpiringWarrantyAssets,
  getFaultyAssets,
  markAssetFaulty,
  recordAssetService,
  replaceAsset,
} from '@/services/assets.service';
import {
  MarkAssetFaultyPayload,
  RecordAssetServicePayload,
  ReplaceAssetPayload,
} from '@/types/assets';

export function useAssetsBySite(siteCode: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['assets', 'site', siteCode],
    queryFn: () => getAssetsBySite(siteCode!),
    enabled: enabled && Boolean(siteCode),
  });
}

export function useFaultyAssets(enabled = true) {
  return useQuery({
    queryKey: ['assets', 'faulty'],
    queryFn: getFaultyAssets,
    enabled,
  });
}

export function useExpiringWarrantyAssets(days: number, enabled = true) {
  return useQuery({
    queryKey: ['assets', 'expiring-warranties', days],
    queryFn: () => getExpiringWarrantyAssets(days),
    enabled,
  });
}

export function useAsset(assetCode: string) {
  return useQuery({
    queryKey: ['assets', assetCode],
    queryFn: () => getAssetByCode(assetCode),
    enabled: Boolean(assetCode),
  });
}

export function useAssetHistory(assetCode: string) {
  return useQuery({
    queryKey: ['assets', assetCode, 'history'],
    queryFn: () => getAssetHistory(assetCode),
    enabled: Boolean(assetCode),
  });
}

function useAssetMutation<TPayload>(
  assetCode: string,
  mutationFn: (code: string, payload: TPayload) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TPayload) => mutationFn(assetCode, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['assets'] }),
        queryClient.invalidateQueries({ queryKey: ['assets', assetCode] }),
        queryClient.invalidateQueries({ queryKey: ['assets', assetCode, 'history'] }),
      ]);
    },
  });
}

export function useRecordAssetService(assetCode: string) {
  return useAssetMutation(assetCode, (code, payload: RecordAssetServicePayload) =>
    recordAssetService(code, payload),
  );
}

export function useMarkAssetFaulty(assetCode: string) {
  return useAssetMutation(assetCode, (code, payload: MarkAssetFaultyPayload) =>
    markAssetFaulty(code, payload),
  );
}

export function useReplaceAsset(assetCode: string) {
  return useAssetMutation(assetCode, (code, payload: ReplaceAssetPayload) => replaceAsset(code, payload));
}
