import { useAuthStore } from '../store/authStore.js';
import type { ErrorCode } from '@smartresume/shared';

export class ApiError extends Error {
  public readonly code: ErrorCode | string;
  public readonly status: number;
  public readonly details?: Array<{ path: string; message: string }> | Record<string, unknown>;
  public readonly requestId?: string;

  constructor(
    code: ErrorCode | string,
    status: number,
    message: string,
    details?: Array<{ path: string; message: string }> | Record<string, unknown>,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

let refreshPromise: Promise<string | null> | null = null;
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'SmartResume',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        useAuthStore.getState().clearAuth();
        return null;
      }

      const json = await res.json();
      const newAccessToken = json.data?.accessToken;
      if (newAccessToken) {
        useAuthStore.getState().setAuth(newAccessToken, json.data.user);
        return newAccessToken;
      }

      useAuthStore.getState().clearAuth();
      return null;
    } catch {
      useAuthStore.getState().clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${apiBaseUrl}${path}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('X-Requested-With', 'SmartResume');

  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken && !options.skipAuth && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle token expired (401 with TOKEN_EXPIRED) with single-flight refresh
  if (response.status === 401 && !options.skipAuth) {
    const errorJson = await response.clone().json().catch(() => null);
    if (errorJson?.error?.code === 'TOKEN_EXPIRED') {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    }
  }

  // Handle binary responses (e.g. PDF blob)
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/pdf')) {
    if (!response.ok) {
      throw new ApiError('PDF_FAILED', response.status, 'Failed to download PDF');
    }
    return (await response.blob()) as unknown as T;
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = json?.error || {};
    throw new ApiError(
      err.code || 'UNKNOWN_ERROR',
      response.status,
      err.message || 'Request failed',
      err.details,
      err.requestId,
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  getBlob: (endpoint: string, options?: RequestOptions) =>
    apiRequest<Blob>(endpoint, { ...options, method: 'GET' }),
  postBlob: (endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<Blob>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
};
