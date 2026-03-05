import type { PaginationMetadata } from "../../core/http/apiTypes";
import { apiClient } from "../../core/http/apiClient";
import { buildQuery, defaultPagination } from "./common";

export const USER_ROLES = [
  "Admin",
  "Manager",
  "Supervisor",
  "PMEngineer",
  "Technician",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserDto = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  officeId: string;
  officeName: string;
  isActive: boolean;
  assignedSitesCount?: number;
  maxAssignedSites?: number;
  performanceRating?: number;
};

export type UserDetailDto = UserDto & {
  specializations: string[];
  assignedSiteIds: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type UserPerformanceDto = {
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  assignedSitesCount: number;
  maxAssignedSites?: number;
  totalVisits: number;
  completedVisits: number;
  approvedVisits: number;
  rejectedVisits: number;
  onTimeVisits: number;
  completionRate: number;
  approvalRate: number;
  onTimeRate: number;
  performanceRating?: number;
  fromDate?: string;
  toDate?: string;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  officeId: string;
  maxAssignedSites?: number;
  specializations?: string[];
};

export type UpdateUserRequest = {
  name: string;
  phoneNumber: string;
  maxAssignedSites?: number;
  specializations?: string[];
};

type PagedUsers = {
  items: UserDto[];
  pagination: PaginationMetadata;
};

type UserListOptions = {
  page?: number;
  pageSize?: number;
  onlyActive?: boolean;
};

export const usersApi = {
  async listByOffice(officeId: string, query: UserListOptions): Promise<PagedUsers> {
    const response = await apiClient.request<UserDto[]>(
      `/users/office/${officeId}${buildQuery({
        onlyActive: query.onlyActive,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 25,
      })}`,
    );

    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async listByRole(role: UserRole, query: UserListOptions & { officeId?: string }): Promise<PagedUsers> {
    const response = await apiClient.request<UserDto[]>(
      `/users/role/${role}${buildQuery({
        officeId: query.officeId,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 25,
      })}`,
    );

    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async getById(userId: string): Promise<UserDetailDto> {
    const response = await apiClient.request<UserDetailDto>(`/users/${userId}`);
    return response.data;
  },

  async create(request: CreateUserRequest): Promise<UserDetailDto> {
    const response = await apiClient.request<UserDetailDto>("/users", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async update(userId: string, request: UpdateUserRequest): Promise<void> {
    await apiClient.request<void>(`/users/${userId}`, {
      method: "PUT",
      body: request,
    });
  },

  async changeRole(userId: string, newRole: UserRole): Promise<void> {
    await apiClient.request<void>(`/users/${userId}/role`, {
      method: "PATCH",
      body: { newRole },
    });
  },

  async activate(userId: string): Promise<void> {
    await apiClient.request<void>(`/users/${userId}/activate`, {
      method: "PATCH",
    });
  },

  async deactivate(userId: string): Promise<void> {
    await apiClient.request<void>(`/users/${userId}/deactivate`, {
      method: "PATCH",
    });
  },

  async unlockAccount(userId: string): Promise<void> {
    await apiClient.request<void>(`/users/${userId}/unlock-account`, {
      method: "PATCH",
    });
  },

  async delete(userId: string): Promise<void> {
    await apiClient.request<void>(`/users/${userId}`, {
      method: "DELETE",
    });
  },

  async getPerformance(userId: string): Promise<UserPerformanceDto> {
    const response = await apiClient.request<UserPerformanceDto>(`/users/${userId}/performance`);
    return response.data;
  },
};
