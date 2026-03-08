export type LoginRequest = {
  email: string;
  password: string;
  mfaCode?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  userId: string;
  email: string;
  role: string;
  officeId?: string;
  requiresPasswordChange: boolean;
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    role: string;
    officeId?: string;
  } | null;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  newPassword: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type MfaSetupRequest = {
  email: string;
  password: string;
};

export type MfaSetupResponse = {
  secret: string;
  otpAuthUri: string;
};

export type VerifyMfaSetupRequest = {
  email: string;
  password: string;
  code: string;
};

export type AuthMessageResponse = {
  message: string;
};
