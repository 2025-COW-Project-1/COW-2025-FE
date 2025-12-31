import { api } from './client';

export type AdminLoginRequest = {
  username: string;
  password: string;
};

export type AdminLoginResponse = {
  // 백엔드가 토큰을 주면 여기에 받기
  accessToken?: string;
};

export const authApi = {
  login(payload: AdminLoginRequest) {
    return api<AdminLoginResponse>('/api/admin/login', {
      method: 'POST',
      body: payload,
    });
  },
  logout() {
    return api<void>('/api/admin/logout', { method: 'POST' });
  },
  me() {
    return api<unknown>('/api/admin/me'); // 스키마 확정되면 타입 정의
  },
};
