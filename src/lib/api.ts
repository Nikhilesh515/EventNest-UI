const BASE_URL = '';

interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiRequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(statusCode: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem('eventnest.access_token');
  } catch {
    return null;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = attemptRefresh();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newToken = getToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      }
    }

    if (!refreshed || res.status === 401) {
      localStorage.removeItem('eventnest.access_token');
      localStorage.removeItem('eventnest.refresh_token');
      localStorage.removeItem('eventnest.user');
      window.location.href = '/login';
      throw new ApiRequestError(401, 'Session expired');
    }
  }

  if (!res.ok) {
    let body: ApiError;
    try {
      body = await res.json();
    } catch {
      body = { statusCode: res.status, message: res.statusText };
    }
    throw new ApiRequestError(body.statusCode, body.message, body.errors);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

async function attemptRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem('eventnest.refresh_token');
  if (!refresh) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { result: { accessToken: string; refreshToken: string } };
    localStorage.setItem('eventnest.access_token', data.result.accessToken);
    localStorage.setItem('eventnest.refresh_token', data.result.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  
  put: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  
  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  
  delete: <T>(path: string) =>
    apiRequest<T>(path, { method: 'DELETE' }),
};
