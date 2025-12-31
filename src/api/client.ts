// src/api/client.ts
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API Error: ${status}`);
    this.status = status;
    this.body = body;
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
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
    credentials: 'include',
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data: unknown = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    // ✅ any 없이 message 안전하게 추출
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

/** 백엔드 에러 응답에서 message 추출 (any 금지 버전) */
function extractErrorMessage(data: unknown): string | undefined {
  if (!data) return undefined;

  // 문자열 에러 본문이면 그대로 사용
  if (typeof data === 'string') return data;

  // 객체라면 message 필드 확인
  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const msg = record['message'];
    if (typeof msg === 'string' && msg.trim().length > 0) return msg;

    // 일부 백엔드가 error / detail / msg 등을 쓰는 경우 대비(선택)
    const alt = record['error'] ?? record['detail'] ?? record['msg'];
    if (typeof alt === 'string' && alt.trim().length > 0) return alt;
  }

  return undefined;
}
