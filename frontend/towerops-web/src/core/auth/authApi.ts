import { apiClient } from "../http/apiClient";
import type { AuthResponse, LoginRequest, LogoutRequest, RefreshTokenRequest } from "./authTypes";

type GenericSuccessMessage = {
  message: string;
};

export const authApi = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: request,
      skipAuth: true,
    });

    return response.data;
  },

  async refresh(request: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: request,
      skipAuth: true,
      suppressGlobalError: true,
    });

    return response.data;
  },

  async logout(request: LogoutRequest): Promise<void> {
    await apiClient.request<GenericSuccessMessage | null>("/auth/logout", {
      method: "POST",
      body: request,
      skipAuth: true,
      suppressGlobalError: true,
    });
  },
};
