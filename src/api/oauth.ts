import { api, withApiBase } from './client';

export type UserSocialLoginResponse = {
  userId?: string;
  email?: string;
  accessToken: string;
};

export function loginWithKakao(code: string) {
  return api<UserSocialLoginResponse>(withApiBase('/oauth/kakao/login'), {
    method: 'POST',
    body: { code },
  });
}

export function loginWithNaver(code: string, state: string) {
  return api<UserSocialLoginResponse>(withApiBase('/oauth/naver/login'), {
    method: 'POST',
    body: { code, state },
  });
}
