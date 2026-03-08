'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSyncConflicts, getSyncStatus, processSyncBatch } from '@/services/sync.service';
import { SyncBatchRequest } from '@/types/sync';

export function useSyncStatus(deviceId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['sync', 'status', deviceId],
    queryFn: () => getSyncStatus(deviceId!),
    enabled: enabled && Boolean(deviceId),
  });
}

export function useSyncConflicts(engineerId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['sync', 'conflicts', engineerId],
    queryFn: () => getSyncConflicts(engineerId!),
    enabled: enabled && Boolean(engineerId),
  });
}

export function useProcessSyncBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncBatchRequest) => processSyncBatch(payload),
    onSuccess: async (_result, payload) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sync', 'status', payload.deviceId] }),
        payload.engineerId
          ? queryClient.invalidateQueries({ queryKey: ['sync', 'conflicts', payload.engineerId] })
          : Promise.resolve(),
      ]);
    },
  });
}
