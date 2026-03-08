import type { PaginationMetadata } from "../../core/http/apiTypes";
import { apiClient } from "../../core/http/apiClient";
import { buildQuery, defaultPagination, type PagedQuery } from "./common";

export type SystemSettingDto = {
  key: string;
  value: string;
  group: string;
  dataType: string;
  description?: string;
  isEncrypted: boolean;
  updatedAtUtc: string;
  updatedBy: string;
};

export type UpsertSystemSettingRequest = {
  key: string;
  value: string;
  group: string;
  dataType: string;
  description?: string;
  isEncrypted: boolean;
};

type SettingsResult = {
  items: SystemSettingDto[];
  pagination: PaginationMetadata;
};

type ServiceTestName = "twilio" | "email" | "firebase";

export const settingsApi = {
  async list(query: PagedQuery): Promise<SettingsResult> {
    const response = await apiClient.request<SystemSettingDto[]>(
      `/settings${buildQuery({
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 25,
        sortBy: query.sortBy ?? "group",
        sortDir: query.sortDir ?? "desc",
      })}`,
    );

    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async byGroup(group: string): Promise<SystemSettingDto[]> {
    const response = await apiClient.request<SystemSettingDto[]>(
      `/settings/${encodeURIComponent(group)}`,
    );
    return response.data;
  },

  async upsert(settings: UpsertSystemSettingRequest[]): Promise<void> {
    await apiClient.request<void>("/settings", {
      method: "PUT",
      body: settings,
    });
  },

  async testConnection(service: ServiceTestName): Promise<string> {
    const response = await apiClient.request<{ message: string }>(`/settings/test/${service}`, {
      method: "POST",
    });
    return response.data.message;
  },
};
