'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as authService from '@/services/auth.service';
import { AuthState, LoginRequest } from '@/types/auth';
import { configureApiClient } from '@/lib/api-client';

const SESSION_KEY = 'towerops.auth';

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<{ accessToken: string | null; refreshToken: string | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ accessToken: null, refreshToken: null, user: null });
  const loginMutation = useMutation({ mutationFn: authService.login });

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AuthState;
      setState(parsed);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state]);

  const refresh = async () => {
    if (!state.refreshToken) {
      return { accessToken: null, refreshToken: null };
    }

    const result = await authService.refresh(state.refreshToken);
    setState((prev) => ({
      ...prev,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.userId,
        email: result.email,
        role: result.role,
        officeId: result.officeId,
      },
    }));

    return { accessToken: result.accessToken, refreshToken: result.refreshToken };
  };

  const logout = async () => {
    if (state.refreshToken) {
      await authService.logout(state.refreshToken).catch(() => null);
    }
    setState({ accessToken: null, refreshToken: null, user: null });
  };

  useEffect(() => {
    configureApiClient({
      getTokensProvider: () => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
      authFailureHandler: () => {
        setState({ accessToken: null, refreshToken: null, user: null });
      },
      refreshTokensHandler: refresh,
    });
  }, [state.accessToken, state.refreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.accessToken),
      login: async (payload: LoginRequest) => {
        const result = await loginMutation.mutateAsync(payload);
        setState({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.userId,
            email: result.email,
            role: result.role,
            officeId: result.officeId,
          },
        });
      },
      logout,
      refresh,
    }),
    [state, loginMutation],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
