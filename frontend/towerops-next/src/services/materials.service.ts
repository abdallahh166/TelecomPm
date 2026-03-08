import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import {
  AddMaterialStockPayload,
  ConsumeMaterialStockPayload,
  CreateMaterialPayload,
  Material,
  MaterialDetail,
  MaterialFilters,
  ReserveMaterialStockPayload,
} from '@/types/materials';

export async function getMaterials(
  officeId: string,
  page = 1,
  filters?: MaterialFilters,
) {
  const response = await apiClient.get<PagedResponse<Material>>('/materials', {
    params: {
      officeId,
      onlyInStock: filters?.onlyInStock,
      page,
      pageSize: filters?.pageSize ?? 10,
    },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getMaterialById(id: string) {
  const response = await apiClient.get<MaterialDetail>(`/materials/${id}`);
  return response.data;
}

export async function getLowStockMaterials(officeId: string) {
  const response = await apiClient.get<Material[]>(`/materials/low-stock/${officeId}`);
  return response.data;
}

export async function createMaterial(payload: CreateMaterialPayload) {
  const response = await apiClient.post<Material>('/materials', payload);
  return response.data;
}

export async function addMaterialStock(id: string, payload: AddMaterialStockPayload) {
  await apiClient.post(`/materials/${id}/stock/add`, payload);
}

export async function reserveMaterialStock(id: string, payload: ReserveMaterialStockPayload) {
  await apiClient.post(`/materials/${id}/stock/reserve`, payload);
}

export async function consumeMaterialStock(id: string, payload: ConsumeMaterialStockPayload) {
  await apiClient.post(`/materials/${id}/stock/consume`, payload);
}
