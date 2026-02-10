import { api, withApiBase } from './client';
import { unwrapApiResult } from './types';
import type { ApiResult } from './types';

export type AdminFeedbackStatus = 'RECEIVED' | 'ANSWERED' | string;

export type AdminFeedbackResponse = {
  id: number;
  title: string;
  content: string;
  answer?: string | null;
  status?: AdminFeedbackStatus | null;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
};

export type AdminFeedbackUpdateRequest = {
  answer: string;
  status: AdminFeedbackStatus;
};

export const adminFeedbackApi = {
  list() {
    return api<AdminFeedbackResponse[] | ApiResult<AdminFeedbackResponse[]>>(
      withApiBase('/admin/feedback'),
    ).then((res) => {
      const data = unwrapApiResult(res);
      return Array.isArray(data) ? data : [];
    });
  },

  update(id: string | number, body: AdminFeedbackUpdateRequest) {
    return api<void>(withApiBase(`/admin/feedback/${id}`), {
      method: 'PUT',
      body,
    });
  },
};
