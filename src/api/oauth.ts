// src/api/oauth.ts
import { api, withApiBase } from './client';

export type UserSocialLoginResponse = {
  memberId: number;
  userName: string;
  email: string;
  accessToken: string;
};

export async function loginWithKakao(
  code: string,
): Promise<UserSocialLoginResponse> {
  return api<UserSocialLoginResponse>(
    withApiBase('/oauth/kakao/login'),
    {
      method: 'POST',
      body: { code },
    },
  );
}

export async function loginWithNaver(
  code: string,
  state: string,
): Promise<UserSocialLoginResponse> {
  return api<UserSocialLoginResponse>(
    withApiBase('/oauth/naver/login'),
    {
      method: 'POST',
      body: { code, state },
    },
  );
}
