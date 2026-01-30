import { api, ApiError, withApiBase } from './client';

export type SnsLink = {
  type?: string;
  url?: string;
  title?: string;
};

export type SnsAdminUpsertBody = {
  url: string;
};

function unwrapApiData<T>(raw: unknown): T | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    if ('data' in record) return record.data as T;
  }
  return raw as T;
}

function safeGet<T>(promise: Promise<T>) {
  return promise.catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return null as T;
    }
    throw err;
  });
}

export const snsApi = {
  getInstagram() {
    return safeGet(
      api<unknown>(withApiBase('/sns/instagram')).then((raw) =>
        unwrapApiData<SnsLink>(raw),
      ),
    );
  },
  getKakao() {
    return safeGet(
      api<unknown>(withApiBase('/sns/kakao')).then((raw) =>
        unwrapApiData<SnsLink>(raw),
      ),
    );
  },
};

// 관리자용
export const snsAdminApi = {
  async upsertInstagram(body: SnsAdminUpsertBody) {
    await api<void>(withApiBase('/admin/sns/instagram'), {
      method: 'PUT',
      body,
    });
  },

  async upsertKakao(body: SnsAdminUpsertBody) {
    await api<void>(withApiBase('/admin/sns/kakao'), {
      method: 'PUT',
      body,
    });
  },
};
