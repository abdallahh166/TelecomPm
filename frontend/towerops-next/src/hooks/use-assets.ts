'use client';

import { useQuery } from '@tanstack/react-query';
import { getExpiringWarranties, getFaultyAssets } from '@/services/assets.service';

export function useFaultyAssets() {
  return useQuery({
    queryKey: ['assets', 'faulty'],
    queryFn: getFaultyAssets,
  });
}

export function useExpiringWarranties() {
  return useQuery({
    queryKey: ['assets', 'expiring-warranties'],
    queryFn: getExpiringWarranties,
  });
}
