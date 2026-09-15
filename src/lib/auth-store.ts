import { create } from 'zustand';
import { api } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
    localStorage.setItem('eventnest.access_token', res.accessToken);
    localStorage.setItem('eventnest.refresh_token', res.refreshToken);
    localStorage.setItem('eventnest.user', JSON.stringify(res.user));
    set({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      isAuthenticated: true,
    });
  },

  register: async (name: string, email: string, password: string) => {
    await api.post('/api/auth/register', { name, email, password });
    // Auto-login after register
    const loginRes = await api.post<AuthResponse>('/api/auth/login', { email, password });
    localStorage.setItem('eventnest.access_token', loginRes.accessToken);
    localStorage.setItem('eventnest.refresh_token', loginRes.refreshToken);
    localStorage.setItem('eventnest.user', JSON.stringify(loginRes.user));
    set({
      user: loginRes.user,
      accessToken: loginRes.accessToken,
      refreshToken: loginRes.refreshToken,
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
}));
