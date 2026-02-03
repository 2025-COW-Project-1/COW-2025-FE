// src/api/oauth.ts
import { api, withApiBase } from './client';

export type UserSocialLoginResponse = {
  memberId: number;
  userName: string;
  email: string;
  accessToken: string;
};

type ApiResult<T> = { data?: T };

function unwrap<T>(raw: ApiResult<T> | T): T {
  if (raw && typeof raw === 'object' && raw !== null && 'data' in raw) {
    return (raw as ApiResult<T>).data as T;
  }
  return raw as T;
}

export async function loginWithKakao(
  code: string,
): Promise<UserSocialLoginResponse> {
  const raw = await api<ApiResult<UserSocialLoginResponse>>(
    withApiBase('/oauth/kakao/login'),
    {
      method: 'POST',
      body: { code },
    },
  );
  return unwrap(raw);
}

export async function loginWithNaver(
  code: string,
  state: string,
): Promise<UserSocialLoginResponse> {
  const raw = await api<ApiResult<UserSocialLoginResponse>>(
    withApiBase('/oauth/naver/login'),
    {
      method: 'POST',
      body: { code, state },
    },
  );
  return unwrap(raw);
}
