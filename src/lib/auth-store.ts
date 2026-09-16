import { create } from 'zustand';
import { api } from './api';

interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  role: string;
  roleName?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthEnvelope {
  result: AuthResponse;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const res = await api.post<AuthEnvelope>('/api/auth/login', { email, password });
    const { user } = res.result;
    const normalized = {
      ...user,
      name: user.displayName || user.name,
      role: user.roleName || user.role,
    };
    localStorage.setItem('eventnest.access_token', res.result.accessToken);
    localStorage.setItem('eventnest.refresh_token', res.result.refreshToken);
    localStorage.setItem('eventnest.user', JSON.stringify(normalized));
    set({
      user: normalized,
      accessToken: res.result.accessToken,
      refreshToken: res.result.refreshToken,
      isAuthenticated: true,
    });
  },

  register: async (name: string, email: string, password: string) => {
    await api.post('/api/auth/register', { displayName: name, email, password });
    const res = await api.post<AuthEnvelope>('/api/auth/login', { email, password });
    const { user } = res.result;
    const normalized = {
      ...user,
      name: user.displayName || user.name,
      role: user.roleName || user.role,
    };
    localStorage.setItem('eventnest.access_token', res.result.accessToken);
    localStorage.setItem('eventnest.refresh_token', res.result.refreshToken);
    localStorage.setItem('eventnest.user', JSON.stringify(normalized));
    set({
      user: normalized,
      accessToken: res.result.accessToken,
      refreshToken: res.result.refreshToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('eventnest.access_token');
    localStorage.removeItem('eventnest.refresh_token');
    localStorage.removeItem('eventnest.user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  hydrate: () => {
    try {
      const token = localStorage.getItem('eventnest.access_token');
      const refresh = localStorage.getItem('eventnest.refresh_token');
      const userJson = localStorage.getItem('eventnest.user');
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({
          user,
          accessToken: token,
          refreshToken: refresh,
          isAuthenticated: true,
        });
      }
    } catch {
      // ignore
    }
  },

  refreshAccessToken: async () => {
    const refresh = localStorage.getItem('eventnest.refresh_token');
    if (!refresh) return false;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });

      if (!res.ok) return false;

      const data = (await res.json()) as AuthEnvelope;
      localStorage.setItem('eventnest.access_token', data.result.accessToken);
      localStorage.setItem('eventnest.refresh_token', data.result.refreshToken);
      set({
        accessToken: data.result.accessToken,
        refreshToken: data.result.refreshToken,
      });
      return true;
    } catch {
      return false;
    }
  },
}));
