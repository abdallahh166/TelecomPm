import { apiClient } from '@/lib/api-client';
import {
  AuthMessageResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MfaSetupRequest,
  MfaSetupResponse,
  ResetPasswordRequest,
  VerifyMfaSetupRequest,
} from '@/types/auth';

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

export async function refresh(refreshToken: string) {
  const response = await apiClient.post<LoginResponse>('/auth/refresh', { refreshToken });
  return response.data;
}

export async function logout(refreshToken: string) {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  const response = await apiClient.post<AuthMessageResponse>('/auth/forgot-password', payload);
  return response.data;
}

export async function resetPassword(payload: ResetPasswordRequest) {
  const response = await apiClient.post<AuthMessageResponse>('/auth/reset-password', payload);
  return response.data;
}

export async function changePassword(payload: ChangePasswordRequest) {
  const response = await apiClient.post<AuthMessageResponse>('/auth/change-password', payload);
  return response.data;
}

export async function setupMfa(payload: MfaSetupRequest) {
  const response = await apiClient.post<MfaSetupResponse>('/auth/mfa/setup', payload);
  return response.data;
}

export async function verifyMfaSetup(payload: VerifyMfaSetupRequest) {
  await apiClient.post('/auth/mfa/verify', payload);
}
