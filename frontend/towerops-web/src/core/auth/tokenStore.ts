import type { AuthSession } from "./authTypes";

const SESSION_STORAGE_KEY = "towerops.auth.session";

export const tokenStore = {
  load(): AuthSession | null {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  },

  save(session: AuthSession): void {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  },

  clear(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  },
};
