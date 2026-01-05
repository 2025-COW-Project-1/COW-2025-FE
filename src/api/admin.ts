// src/api/admin.ts
import { api } from './client';

export type AdminMe = {
  id: number;
  username: string;
  role: string; // "ADMIN" 등
};

export type AdminLoginBody = {
  username: string;
  password: string;
};

const ADMIN_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL ?? '/remote';

function joinBase(path: string) {
  const base = ADMIN_BASE.endsWith('/') ? ADMIN_BASE.slice(0, -1) : ADMIN_BASE;
  return `${base}${path}`;
}

export const adminApi = {
  // 로그인: 204 No Content 기대 → void로 처리
  login(body: AdminLoginBody) {
    return api<void>(joinBase('/api/admin/login'), {
      method: 'POST',
      body,
    });
  },

  // 내 정보 조회: 쿠키(ADMIN_ACCESS_TOKEN)가 자동으로 포함되어야 성공
  me() {
    return api<AdminMe>(joinBase('/api/admin/me'));
  },

  // (나중에 필요하면)
  logout() {
    return api<void>(joinBase('/api/admin/logout'), { method: 'POST' });
  },
};
