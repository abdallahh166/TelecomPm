import { apiClient } from "../../core/http/apiClient";
import { defaultPagination, type PagedQuery, buildQuery } from "./common";
import type { PaginationMetadata } from "../../core/http/apiTypes";

export type OfficeDto = {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string;
  totalSites: number;
  activeEngineers: number;
  isActive: boolean;
};

export type OfficeDetailDto = OfficeDto & {
  street: string;
  buildingNumber?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  activeTechnicians: number;
  createdAt: string;
  updatedAt?: string;
};

export type CreateOfficeRequest = {
  code: string;
  name: string;
  region: string;
  address: {
    street?: string;
    city: string;
    region: string;
    details?: string;
  };
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type UpdateOfficeRequest = {
  name: string;
  region: string;
  address: {
    street?: string;
    city: string;
    region: string;
    details?: string;
  };
  latitude?: number;
  longitude?: number;
};

export type UpdateOfficeContactRequest = {
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
};

type OfficeListQuery = PagedQuery & {
  onlyActive?: boolean;
};

type OfficeListResult = {
  items: OfficeDto[];
  pagination: PaginationMetadata;
};

export const officesApi = {
  async list(query: OfficeListQuery): Promise<OfficeListResult> {
    const response = await apiClient.request<OfficeDto[]>(
      `/offices${buildQuery({
        onlyActive: query.onlyActive,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 25,
        sortBy: query.sortBy ?? "code",
        sortDir: query.sortDir ?? "desc",
      })}`,
    );

    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async getById(officeId: string): Promise<OfficeDetailDto> {
    const response = await apiClient.request<OfficeDetailDto>(`/offices/${officeId}`);
    return response.data;
  },

  async create(request: CreateOfficeRequest): Promise<OfficeDetailDto> {
    const response = await apiClient.request<OfficeDetailDto>("/offices", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async update(officeId: string, request: UpdateOfficeRequest): Promise<void> {
    await apiClient.request<void>(`/offices/${officeId}`, {
      method: "PUT",
      body: request,
    });
  },

  async updateContact(officeId: string, request: UpdateOfficeContactRequest): Promise<void> {
    await apiClient.request<void>(`/offices/${officeId}/contact`, {
      method: "PATCH",
      body: request,
    });
  },

  async remove(officeId: string): Promise<void> {
    await apiClient.request<void>(`/offices/${officeId}`, {
      method: "DELETE",
    });
  },
};
