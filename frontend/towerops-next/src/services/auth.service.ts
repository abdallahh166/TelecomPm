import { apiClient } from '@/lib/api-client';
import { LoginRequest, LoginResponse } from '@/types/auth';

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
