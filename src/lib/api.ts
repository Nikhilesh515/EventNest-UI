import { tokenHolder } from "./token-holder";

const BASE_URL = "";

interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiRequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = tokenHolder.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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
      const newToken = tokenHolder.get();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      }
    }

    if (!refreshed || res.status === 401) {
      tokenHolder.set(null);
      tokenHolder.notifyExpired();
      throw new ApiRequestError(401, "Session expired");
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
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { result: { accessToken: string } };
    tokenHolder.set(data.result.accessToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),

  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
