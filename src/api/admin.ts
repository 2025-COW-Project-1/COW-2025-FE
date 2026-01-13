// src/api/admin.ts
import { api } from './client';

export type AdminLoginBody = {
  username: string;
  password: string;
};

export type AdminMe = {
  id: number;
  username: string;
  role: string;
};

export type VerifyPasswordBody = {
  password: string;
};

export type UpdateUsernameBody = {
  username: string;
};

export type UpdatePasswordBody = {
  password: string;
};

const ADMIN_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

function joinBase(path: string) {
  const base = ADMIN_BASE.endsWith('/') ? ADMIN_BASE.slice(0, -1) : ADMIN_BASE;
  return `${base}${path}`;
}

let meCache: Promise<AdminMe> | null = null;

export const adminApi = {
  login(body: AdminLoginBody) {
    meCache = null;
    return api<void>(joinBase('/admin/login'), {
      method: 'POST',
      body,
    });
  },

  me() {
    if (!meCache) {
      meCache = api<AdminMe>(joinBase('/admin/me')).catch((err) => {
        meCache = null;
        throw err;
      });
    }
    return meCache;
  },

  logout() {
    meCache = null;
    return api<void>(joinBase('/admin/logout'), { method: 'POST' });
  },

  verifyPassword(body: VerifyPasswordBody) {
    return api<void>(joinBase('/admin/account/verify-password'), {
      method: 'POST',
      body,
    });
  },

  updateUsername(body: UpdateUsernameBody) {
    meCache = null;
    return api<void>(joinBase('/admin/account/username'), {
      method: 'PATCH',
      body,
    });
  },

  updatePassword(body: UpdatePasswordBody) {
    meCache = null;
    return api<void>(joinBase('/admin/account/password'), {
      method: 'PATCH',
      body,
    });
  },
};
