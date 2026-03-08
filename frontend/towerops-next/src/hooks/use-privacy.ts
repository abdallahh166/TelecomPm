'use client';

import { useMutation } from '@tanstack/react-query';
import {
  downloadMyOperationalDataExport,
  requestMyOperationalDataExport,
} from '@/services/privacy.service';

export function useRequestMyDataExport() {
  return useMutation({
    mutationFn: requestMyOperationalDataExport,
  });
}

export function useDownloadMyDataExport() {
  return useMutation({
    mutationFn: (requestId: string) => downloadMyOperationalDataExport(requestId),
  });
}
