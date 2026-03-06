import type { PaginationMetadata } from "../../core/http/apiTypes";
import { apiClient } from "../../core/http/apiClient";
import { buildQuery, defaultPagination } from "./common";

export type MaterialDto = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  currentStock: number;
  unit: string;
  minimumStock: number;
  unitCost: number;
  currency: string;
  isLowStock: boolean;
  isActive: boolean;
};

export type MaterialDetailDto = MaterialDto & {
  supplier?: string;
  lastRestockDate?: string;
  reorderQuantity?: number;
  recentTransactions: unknown[];
  activeReservations: unknown[];
};

export type CreateMaterialRequest = {
  code: string;
  name: string;
  description?: string;
  category: string;
  officeId: string;
  initialStock: number;
  unit: string;
  minimumStock: number;
  unitCost: number;
  supplier?: string;
};

export type UpdateMaterialRequest = {
  name: string;
  description?: string;
  category: string;
  supplier?: string;
};

export type AddStockRequest = {
  quantity: number;
  unit: string;
  supplier?: string;
};

export type ReserveStockRequest = {
  visitId: string;
  quantity: number;
  unit: string;
};

export type ConsumeStockRequest = {
  visitId: string;
};

type MaterialListResult = {
  items: MaterialDto[];
  pagination: PaginationMetadata;
};

type MaterialListQuery = {
  officeId: string;
  onlyInStock?: boolean;
  page?: number;
  pageSize?: number;
};

export const materialsApi = {
  async list(query: MaterialListQuery): Promise<MaterialListResult> {
    const response = await apiClient.request<MaterialDto[]>(
      `/materials${buildQuery({
        officeId: query.officeId,
        onlyInStock: query.onlyInStock,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 25,
      })}`,
    );

    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async lowStock(officeId: string): Promise<MaterialDto[]> {
    const response = await apiClient.request<MaterialDto[]>(`/materials/low-stock/${officeId}`);
    return response.data;
  },

  async getById(id: string): Promise<MaterialDetailDto> {
    const response = await apiClient.request<MaterialDetailDto>(`/materials/${id}`);
    return response.data;
  },

  async create(request: CreateMaterialRequest): Promise<MaterialDetailDto> {
    const response = await apiClient.request<MaterialDetailDto>("/materials", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async update(id: string, request: UpdateMaterialRequest): Promise<void> {
    await apiClient.request<void>(`/materials/${id}`, {
      method: "PUT",
      body: request,
    });
  },

  async remove(id: string): Promise<void> {
    await apiClient.request<void>(`/materials/${id}`, {
      method: "DELETE",
    });
  },

  async addStock(id: string, request: AddStockRequest): Promise<void> {
    await apiClient.request<void>(`/materials/${id}/stock/add`, {
      method: "POST",
      body: request,
    });
  },

  async reserveStock(id: string, request: ReserveStockRequest): Promise<void> {
    await apiClient.request<void>(`/materials/${id}/stock/reserve`, {
      method: "POST",
      body: request,
    });
  },

  async consumeStock(id: string, request: ConsumeStockRequest): Promise<void> {
    await apiClient.request<void>(`/materials/${id}/stock/consume`, {
      method: "POST",
      body: request,
    });
  },
};
