// src/api/admin.ts
import { api } from './client';

export type AdminLoginBody = {
  username: string;
  password: string;
};

export type UpdateAccountBody = {
  currentUserId: string;
  currentPassword: string;
  newUserId: string;
  newPassword: string;
};

const ADMIN_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

function joinBase(path: string) {
  const base = ADMIN_BASE.endsWith('/') ? ADMIN_BASE.slice(0, -1) : ADMIN_BASE;
  return `${base}${path}`;
}

export const adminApi = {
  async login(body: AdminLoginBody) {
    try {
      return await api<void>(joinBase('/admin/login'), {
        method: 'POST',
        body,
      });
    } catch (err) {
      if (DEMO_MODE) return;
      throw err;
    }
  },

  logout() {
    return api<void>(joinBase('/admin/logout'), { method: 'POST' });
  },

  updateAccount(body: UpdateAccountBody) {
    return api<void>(joinBase('/admin/account'), {
      method: 'PATCH',
      body,
    }).catch((err) => {
      if (DEMO_MODE) return undefined as void;
      throw err;
    });
  },
};
