import { api, withApiBase, ApiError } from './client';

export type IntroduceDetailSection = {
  id?: number | string;
  title?: string;
  subtitle?: string;
  subTitle?: string;
  summary?: string;
  description?: string;
  content?: string;
  body?: string;
  contents?: string;
  sortOrder?: number;
  order?: number;
  imageKey?: string;
  mediaKey?: string;
  iconKey?: string;
};

export type IntroduceDetailResponse = {
  title?: string;
  subtitle?: string;
  summary?: string;
  heroLogoKeys?: string[];
  sections?: IntroduceDetailSection[];
  updatedAt?: string;
};

export type IntroduceMainSummary = {
  title?: string;
  subtitle?: string;
  summary?: string;
  heroLogoKeys?: string[];
};

export type IntroduceSnsItem = {
  id?: number | string;
  type?: string;
  title?: string;
  url?: string;
  iconKey?: string;
  sortOrder?: number;
  active?: boolean;
};

function unwrapApiData<T>(raw: unknown): T | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw as T;
  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    if ('data' in record) return record.data as T;
  }
  return raw as T;
}

// 404 -> 빈 화면
function safeGet<T>(promise: Promise<T>) {
  return promise.catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return null as T;
    }
    throw err;
  });
}

export const introApi = {
  getDetail() {
    return safeGet(
      api<unknown>(withApiBase('/introduce')).then((raw) =>
        unwrapApiData<IntroduceDetailResponse>(raw)
      )
    );
  },

  getMain() {
    return safeGet(
      api<unknown>(withApiBase('/introduce/main')).then((raw) =>
        unwrapApiData<IntroduceMainSummary>(raw)
      )
    );
  },

  getSns() {
    return safeGet(
      api<unknown>(withApiBase('/introduce/sns')).then((raw) => {
        const data = unwrapApiData<IntroduceSnsItem[]>(raw);
        return Array.isArray(data) ? data : [];
      })
    );
  },
};
