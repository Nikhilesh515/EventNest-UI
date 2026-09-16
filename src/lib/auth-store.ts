import { create } from "zustand";
import { api } from "./api";
import { tokenHolder } from "./token-holder";
import type { User } from "../types";

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface AuthEnvelope {
  result: AuthResponse;
}

const PROFILE_KEY = "eventnest.user";
const LEGACY_KEYS = ["eventnest.access_token", "eventnest.refresh_token"];

function clearLegacyKeys(): void {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}

function normalizeUser(user: User): User {
  return {
    ...user,
    name: user.displayName || user.name,
    role: user.roleName || user.role,
  };
}

function readStoredProfile(): User | null {
  try {
    const json = localStorage.getItem(PROFILE_KEY);
    if (!json) return null;
    return JSON.parse(json) as User;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapping: true,

  login: async (email: string, password: string) => {
    const res = await api.post<AuthEnvelope>("/api/auth/login", {
      email,
      password,
    });
    const normalized = normalizeUser(res.result.user);
    tokenHolder.set(res.result.accessToken);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
    set({
      user: normalized,
      accessToken: res.result.accessToken,
      isAuthenticated: true,
      isBootstrapping: false,
    });
  },

  register: async (name: string, email: string, password: string) => {
    const res = await api.post<AuthEnvelope>("/api/auth/register", {
      displayName: name,
      email,
      password,
    });
    const normalized = normalizeUser(res.result.user);
    tokenHolder.set(res.result.accessToken);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
    set({
      user: normalized,
      accessToken: res.result.accessToken,
      isAuthenticated: true,
      isBootstrapping: false,
    });
  },

  logout: () => {
    void api.post("/api/auth/logout", {}).catch(() => undefined);
    clearLegacyKeys();
    localStorage.removeItem(PROFILE_KEY);
    tokenHolder.set(null);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  bootstrap: async () => {
    clearLegacyKeys();
    const stored = readStoredProfile();
    set({ user: stored, isBootstrapping: true });

    try {
      const res = await api.post<AuthEnvelope>("/api/auth/refresh", {});
      const normalized = normalizeUser(res.result.user);
      tokenHolder.set(res.result.accessToken);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
      set({
        user: normalized,
        accessToken: res.result.accessToken,
        isAuthenticated: true,
        isBootstrapping: false,
      });
    } catch {
      localStorage.removeItem(PROFILE_KEY);
      tokenHolder.set(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isBootstrapping: false,
      });
    }
  },
}));

tokenHolder.setExpiredHandler(() => useAuthStore.getState().logout());

export function useEffectiveAuth(): boolean {
  return useAuthStore(
    (s) => s.isAuthenticated || (s.isBootstrapping && s.user !== null),
  );
}
