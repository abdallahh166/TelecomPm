'use client';

import { useQuery } from '@tanstack/react-query';
import { getSyncConflicts, getSyncStatus } from '@/services/sync.service';

export function useSyncStatus(deviceId: string) {
  return useQuery({
    queryKey: ['sync', 'status', deviceId],
    queryFn: () => getSyncStatus(deviceId),
    enabled: Boolean(deviceId),
  });
}

export function useSyncConflicts(engineerId: string) {
  return useQuery({
    queryKey: ['sync', 'conflicts', engineerId],
    queryFn: () => getSyncConflicts(engineerId),
    enabled: Boolean(engineerId),
  });
}
