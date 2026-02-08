import { api, withApiBase } from './client';
import { unwrapApiResult } from './types';
import type { ApiResult } from './types';

export type AdminNoticeResponse = {
  id: number;
  title: string;
  content: string;
  imageKeys?: string[] | null;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
};

export type AdminNoticeUpsertRequest = {
  title: string;
  content: string;
  imageKeys?: string[];
};

export type NoticePresignRequest = {
  fileName: string;
  contentType: string;
};

export type NoticePresignResponse = {
  key: string;
  uploadUrl: string;
  expiresInSeconds: number;
};

export const adminNoticesApi = {
  list() {
    return api<ApiResult<AdminNoticeResponse[]> | AdminNoticeResponse[]>(
      withApiBase('/admin/notices')
    ).then((res) => unwrapApiResult(res));
  },

  getById(noticeId: string) {
    return api<ApiResult<AdminNoticeResponse> | AdminNoticeResponse>(
      withApiBase(`/admin/notices/${noticeId}`)
    ).then((res) => unwrapApiResult(res));
  },

  create(body: AdminNoticeUpsertRequest) {
    return api<ApiResult<AdminNoticeResponse> | AdminNoticeResponse>(
      withApiBase('/admin/notices'),
      {
        method: 'POST',
        body,
      }
    ).then((res) => unwrapApiResult(res));
  },

  update(noticeId: string, body: AdminNoticeUpsertRequest) {
    return api<ApiResult<AdminNoticeResponse> | AdminNoticeResponse>(
      withApiBase(`/admin/notices/${noticeId}`),
      {
        method: 'PUT',
        body,
      }
    ).then((res) => unwrapApiResult(res));
  },

  delete(noticeId: string) {
    return api<void>(withApiBase(`/admin/notices/${noticeId}`), {
      method: 'DELETE',
    });
  },

  presignImage(body: NoticePresignRequest) {
    return api<ApiResult<NoticePresignResponse> | NoticePresignResponse>(
      withApiBase('/admin/notices/presign-put/images'),
      {
        method: 'POST',
        body,
      }
    ).then((res) => unwrapApiResult(res));
  },
};
