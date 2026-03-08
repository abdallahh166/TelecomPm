'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSite, getSiteById, getSitesByOffice, importSiteData, importSites, updateSite } from '@/services/sites.service';
import { CreateSitePayload, SiteImportKind, UpdateSitePayload } from '@/types/sites';

export function useSites(officeId: string, page = 1) {
  return useQuery({
    queryKey: ['sites', officeId, page],
    queryFn: () => getSitesByOffice(officeId, page),
    enabled: Boolean(officeId),
  });
}

export function useSite(siteId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['sites', siteId],
    queryFn: () => getSiteById(siteId!),
    enabled: enabled && Boolean(siteId),
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSitePayload) => createSite(payload),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sites'] }),
        queryClient.invalidateQueries({ queryKey: ['sites', result.id] }),
      ]);
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { siteId: string; payload: UpdateSitePayload }) =>
      updateSite(variables.siteId, variables.payload),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sites'] }),
        queryClient.invalidateQueries({ queryKey: ['sites', variables.siteId] }),
      ]);
    },
  });
}

export function useImportSites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importSites(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useImportSiteData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { kind: SiteImportKind; file: File }) => importSiteData(variables.kind, variables.file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}
