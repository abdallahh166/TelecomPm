'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getDataExportRequest, requestDataExport } from '@/services/data-exports.service';

export function useRequestDataExport() {
  return useMutation({ mutationFn: requestDataExport });
}

export function useDataExportRequest(requestId: string | null) {
  return useQuery({
    queryKey: ['data-export', requestId],
    queryFn: () => getDataExportRequest(requestId as string),
    enabled: Boolean(requestId),
  });
}
