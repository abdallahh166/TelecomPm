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
