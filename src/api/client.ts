type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export const withApiBase = (path: string) =>
  API_BASE ? `${API_BASE}${path}` : path;

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API Error: ${status}`);
    this.status = status;
    this.body = body;
  }
}

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? 'access_token';

function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

export async function api<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const method = opts.method ?? 'GET';

  const headers: Record<string, string> = {
    ...(opts.headers ?? {}),
  };

  const hasBody = opts.body !== undefined;
  if (hasBody) headers['Content-Type'] = 'application/json';

  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: hasBody ? JSON.stringify(opts.body) : undefined,
    credentials: 'include', // 쿠키 삭제 응답 처리 가능
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data: unknown = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const msg = extractErrorMessage(data);
    throw new ApiError(res.status, data, msg);
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

// Extract message from error response.
function extractErrorMessage(data: unknown): string | undefined {
  if (!data) return undefined;

  if (typeof data === 'string') return data;

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const msg = record['message'];
    if (typeof msg === 'string' && msg.trim().length > 0) return msg;

    const alt = record['error'] ?? record['detail'] ?? record['msg'];
    if (typeof alt === 'string' && alt.trim().length > 0) return alt;
  }

  return undefined;
}
