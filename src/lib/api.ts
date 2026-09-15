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

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

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
