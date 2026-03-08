'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addMaterialStock,
  consumeMaterialStock,
  createMaterial,
  getLowStockMaterials,
  getMaterialById,
  getMaterials,
  reserveMaterialStock,
} from '@/services/materials.service';
import {
  AddMaterialStockPayload,
  ConsumeMaterialStockPayload,
  CreateMaterialPayload,
  MaterialFilters,
  ReserveMaterialStockPayload,
} from '@/types/materials';

export function useMaterials(
  officeId: string | undefined,
  page = 1,
  filters?: MaterialFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ['materials', officeId, page, filters?.onlyInStock, filters?.pageSize],
    queryFn: () => getMaterials(officeId!, page, filters),
    enabled: enabled && Boolean(officeId),
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => getMaterialById(id),
    enabled: Boolean(id),
  });
}

export function useLowStockMaterials(officeId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['materials', 'low-stock', officeId],
    queryFn: () => getLowStockMaterials(officeId!),
    enabled: enabled && Boolean(officeId),
  });
}

function useMaterialMutation<TPayload>(
  id: string,
  mutationFn: (materialId: string, payload: TPayload) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TPayload) => mutationFn(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['materials'] }),
        queryClient.invalidateQueries({ queryKey: ['materials', id] }),
      ]);
    },
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMaterialPayload) => createMaterial(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useAddMaterialStock(id: string) {
  return useMaterialMutation(id, (materialId, payload: AddMaterialStockPayload) =>
    addMaterialStock(materialId, payload),
  );
}

export function useReserveMaterialStock(id: string) {
  return useMaterialMutation(id, (materialId, payload: ReserveMaterialStockPayload) =>
    reserveMaterialStock(materialId, payload),
  );
}

export function useConsumeMaterialStock(id: string) {
  return useMaterialMutation(id, (materialId, payload: ConsumeMaterialStockPayload) =>
    consumeMaterialStock(materialId, payload),
  );
}
