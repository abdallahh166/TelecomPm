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
