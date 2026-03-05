/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { authApi } from "./authApi";
import { extractPermissions, extractRole } from "./jwt";
import { tokenStore } from "./tokenStore";
import type { AuthResponse, AuthSession, LoginRequest } from "./authTypes";
import { apiClient, setApiAuthHandlers } from "../http/apiClient";

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isExpired(utc: string, skewSeconds = 0): boolean {
  const expiresAt = Date.parse(utc);
  if (Number.isNaN(expiresAt)) {
    return true;
  }

  const now = Date.now();
  return expiresAt <= now + skewSeconds * 1000;
}

function normalizeSession(source: AuthResponse): AuthSession {
  return {
    ...source,
    role: extractRole(source.accessToken) ?? source.role,
    permissions: extractPermissions(source.accessToken),
  };
}

function commitSession(session: AuthSession | null): void {
  if (!session) {
    tokenStore.clear();
    apiClient.setAccessToken(null);
    return;
  }

  tokenStore.save(session);
  apiClient.setAccessToken(session.accessToken);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  const clearSession = useCallback(() => {
    setSession(null);
    commitSession(null);
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const result = await authApi.login(request);
    const normalized = normalizeSession(result);
    setSession(normalized);
    commitSession(normalized);
  }, []);

  const logout = useCallback(async () => {
    const current = tokenStore.load();
    if (current?.refreshToken) {
      try {
        await authApi.logout({ refreshToken: current.refreshToken });
      } catch {
        // Logout should always clear local session even if network fails.
      }
    }

    clearSession();
  }, [clearSession]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (refreshInFlight.current) {
      return refreshInFlight.current;
    }

    refreshInFlight.current = (async () => {
      const stored = tokenStore.load();
      if (!stored || isExpired(stored.refreshTokenExpiresAtUtc)) {
        clearSession();
        return null;
      }

      try {
        const refreshed = await authApi.refresh({
          refreshToken: stored.refreshToken,
        });
        const normalized = normalizeSession(refreshed);
        setSession(normalized);
        commitSession(normalized);
        return normalized.accessToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    return refreshInFlight.current;
  }, [clearSession]);

  useEffect(() => {
    setApiAuthHandlers({
      refreshAccessToken,
      onAuthFailure: clearSession,
    });

    return () => {
      setApiAuthHandlers(null);
    };
  }, [clearSession, refreshAccessToken]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (): Promise<void> => {
      const stored = tokenStore.load();
      if (!stored) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      if (!isExpired(stored.expiresAtUtc, 30)) {
        apiClient.setAccessToken(stored.accessToken);
        if (mounted) {
          setSession(stored);
          setIsLoading(false);
        }
        return;
      }

      if (isExpired(stored.refreshTokenExpiresAtUtc)) {
        if (mounted) {
          clearSession();
          setIsLoading(false);
        }
        return;
      }

      try {
        await refreshAccessToken();
      } catch {
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [clearSession, refreshAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isAuthenticated: !!session,
      login,
      logout,
      hasPermission: (permission: string) =>
        !!session && session.permissions.includes(permission),
    }),
    [isLoading, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
