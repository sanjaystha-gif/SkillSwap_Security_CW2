const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | object;
  headers?: Record<string, string>;
}

function buildUrl(path: string): string {
  return `${API_BASE}${path}`;
}

async function apiRequest<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = buildUrl(path);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const body =
    options.body && typeof options.body === 'object' && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | undefined);

  const init: RequestInit = {
    credentials: 'include',
    ...options,
    body,
    headers,
  };

  const response = await fetch(url, init);
  const contentType = response.headers.get('content-type');
  const payload = contentType?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    type ApiError = Error & {
      status?: number;
      payload?: unknown;
    };

    const error = new Error(payload?.message || response.statusText || 'API request failed') as ApiError;
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload as T;
}

export default {
  request: apiRequest,
};
