import { axiosInstance } from "../../../services/api/axiosInstance";
import type {
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  MfaSetupRequest,
  MfaSetupResponse,
  MfaVerifyRequest,
} from "../types";

export const authApi = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>("/auth/login", request, {
      skipAuth: true,
      suppressGlobalError: true,
    } as object);
    return data;
  },

  async refresh(request: RefreshTokenRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>("/auth/refresh", request, {
      skipAuth: true,
      suppressGlobalError: true,
    } as object);
    return data;
  },

  async logout(request: LogoutRequest): Promise<void> {
    await axiosInstance.post("/auth/logout", request, {
      skipAuth: true,
      suppressGlobalError: true,
    } as object);
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/auth/forgot-password",
      request,
      { skipAuth: true, suppressGlobalError: true } as object,
    );
    return data;
  },

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/auth/reset-password",
      request,
      { skipAuth: true, suppressGlobalError: true } as object,
    );
    return data;
  },

  async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/auth/change-password",
      request,
      { suppressGlobalError: true } as object,
    );
    return data;
  },

  async mfaSetup(request: MfaSetupRequest): Promise<MfaSetupResponse> {
    const { data } = await axiosInstance.post<MfaSetupResponse>("/auth/mfa/setup", request, {
      skipAuth: true,
      suppressGlobalError: true,
    } as object);
    return data;
  },

  async mfaVerify(request: MfaVerifyRequest): Promise<void> {
    await axiosInstance.post("/auth/mfa/verify", request, {
      skipAuth: true,
      suppressGlobalError: true,
    } as object);
  },
};
