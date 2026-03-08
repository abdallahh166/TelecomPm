'use client';

import { useMutation } from '@tanstack/react-query';
import {
  changePassword,
  forgotPassword,
  resetPassword,
  setupMfa,
  verifyMfaSetup,
} from '@/services/auth.service';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  MfaSetupRequest,
  ResetPasswordRequest,
  VerifyMfaSetupRequest,
} from '@/types/auth';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => forgotPassword(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => resetPassword(payload),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
  });
}

export function useSetupMfa() {
  return useMutation({
    mutationFn: (payload: MfaSetupRequest) => setupMfa(payload),
  });
}

export function useVerifyMfaSetup() {
  return useMutation({
    mutationFn: (payload: VerifyMfaSetupRequest) => verifyMfaSetup(payload),
  });
}
