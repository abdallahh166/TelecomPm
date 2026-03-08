'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOffice,
  deleteOffice,
  getOfficeById,
  getOfficeStatistics,
  getOffices,
  getOfficesByRegion,
  updateOffice,
  updateOfficeContact,
} from '@/services/offices.service';
import {
  CreateOfficePayload,
  OfficeListFilters,
  UpdateOfficeContactPayload,
  UpdateOfficePayload,
} from '@/types/offices';

export function useOffices(page = 1, filters?: OfficeListFilters, enabled = true) {
  return useQuery({
    queryKey: ['offices', page, filters?.onlyActive, filters?.pageSize, filters?.sortBy, filters?.sortDir],
    queryFn: () => getOffices(page, filters),
    enabled,
  });
}

export function useOffice(officeId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['offices', officeId],
    queryFn: () => getOfficeById(officeId!),
    enabled: enabled && Boolean(officeId),
  });
}

export function useOfficesByRegion(region: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['offices', 'region', region],
    queryFn: () => getOfficesByRegion(region!),
    enabled: enabled && Boolean(region),
  });
}

export function useOfficeStatistics(officeId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['offices', officeId, 'statistics'],
    queryFn: () => getOfficeStatistics(officeId!),
    enabled: enabled && Boolean(officeId),
  });
}

async function invalidateOfficeCaches(queryClient: ReturnType<typeof useQueryClient>, officeId?: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['offices'] }),
    officeId ? queryClient.invalidateQueries({ queryKey: ['offices', officeId] }) : Promise.resolve(),
    officeId ? queryClient.invalidateQueries({ queryKey: ['offices', officeId, 'statistics'] }) : Promise.resolve(),
  ]);
}

export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOfficePayload) => createOffice(payload),
    onSuccess: async (result) => {
      await invalidateOfficeCaches(queryClient, result?.id);
    },
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { officeId: string; payload: UpdateOfficePayload }) =>
      updateOffice(variables.officeId, variables.payload),
    onSuccess: async (_result, variables) => {
      await invalidateOfficeCaches(queryClient, variables.officeId);
    },
  });
}

export function useUpdateOfficeContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { officeId: string; payload: UpdateOfficeContactPayload }) =>
      updateOfficeContact(variables.officeId, variables.payload),
    onSuccess: async (_result, variables) => {
      await invalidateOfficeCaches(queryClient, variables.officeId);
    },
  });
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (officeId: string) => deleteOffice(officeId),
    onSuccess: async (_result, officeId) => {
      await invalidateOfficeCaches(queryClient, officeId);
    },
  });
}
