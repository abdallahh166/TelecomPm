export type LoginRequest = {
  email: string;
  password: string;
  mfaCode?: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type AuthResponse = {
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  userId: string;
  email: string;
  role: string;
  officeId: string;
  requiresPasswordChange: boolean;
};

export type AuthSession = AuthResponse & {
  permissions: string[];
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

export type MfaVerifyRequest = {
  email: string;
  password: string;
  code: string;
};
