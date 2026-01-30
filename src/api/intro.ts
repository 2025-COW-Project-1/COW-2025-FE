import { api, withApiBase, ApiError } from './client';

export type IntroduceHeroLogo = {
  key?: string;
  imageUrl?: string;
};

export type IntroduceMainSummary = {
  title?: string;
  subtitle?: string;
  summary?: string;
  heroLogos?: IntroduceHeroLogo[];
};

export type IntroduceDetailPayload = {
  brand?: {
    title?: string;
    subtitle?: string;
  };
  intro?: {
    title?: string;
    slogan?: string;
    body?: string;
  };
  purpose?: {
    title?: string;
    description?: string;
  };
  currentLogo?: {
    title?: string;
    imageKey?: string;
    imageUrl?: string;
    description?: string;
  };
  logoHistories?: Array<{
    year?: string;
    imageKey?: string;
    imageUrl?: string;
    description?: string;
  }>;
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

type ApiResult<T> = {
  data?: T;
};

function safeGet<T>(promise: Promise<T>) {
  return promise.catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return null as T;
    }
    throw err;
  });
}

export const introApi = {
  getDetail(): Promise<IntroduceDetailPayload | null> {
    return safeGet(
      api<ApiResult<IntroduceDetailPayload>>(withApiBase('/introduce')).then(
        (res) => res?.data ?? null
      )
    );
  },

  getMain(): Promise<IntroduceMainSummary | null> {
    return safeGet(
      api<ApiResult<IntroduceMainSummary>>(withApiBase('/introduce/main')).then(
        (res) => res?.data ?? null
      )
    );
  },

  getSns(): Promise<IntroduceSnsItem[]> {
    return safeGet(
      api<ApiResult<IntroduceSnsItem[]>>(withApiBase('/introduce/sns')).then(
        (res) => res?.data ?? []
      )
    );
  },
};