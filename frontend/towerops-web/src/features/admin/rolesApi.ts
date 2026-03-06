import type { PaginationMetadata } from "../../core/http/apiTypes";
import { apiClient } from "../../core/http/apiClient";
import { buildQuery, defaultPagination, type PagedQuery } from "./common";

export type RoleDto = {
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  permissions: string[];
};

export type CreateRoleRequest = {
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  permissions: string[];
};

export type UpdateRoleRequest = {
  displayName: string;
  description?: string;
  isActive: boolean;
  permissions: string[];
};

type RolesResult = {
  items: RoleDto[];
  pagination: PaginationMetadata;
};

export const rolesApi = {
  async list(query: PagedQuery): Promise<RolesResult> {
    const response = await apiClient.request<RoleDto[]>(
      `/roles${buildQuery({
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 25,
        sortBy: query.sortBy ?? "name",
        sortDir: query.sortDir ?? "desc",
      })}`,
    );

    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async listPermissions(): Promise<string[]> {
    const response = await apiClient.request<string[]>("/roles/permissions");
    return response.data;
  },

  async getById(roleName: string): Promise<RoleDto> {
    const response = await apiClient.request<RoleDto>(`/roles/${roleName}`);
    return response.data;
  },

  async create(request: CreateRoleRequest): Promise<RoleDto> {
    const response = await apiClient.request<RoleDto>("/roles", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async update(roleName: string, request: UpdateRoleRequest): Promise<RoleDto> {
    const response = await apiClient.request<RoleDto>(`/roles/${roleName}`, {
      method: "PUT",
      body: request,
    });
    return response.data;
  },

  async remove(roleName: string): Promise<void> {
    await apiClient.request<void>(`/roles/${roleName}`, {
      method: "DELETE",
    });
  },
};
