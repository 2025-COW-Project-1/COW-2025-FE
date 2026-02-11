import { api, withApiBase } from './client';
import { unwrapApiResult } from './types';
import type { ApiResult } from './types';

export type NoticeResponse = {
  id: number;
  title: string;
  content?: string | null;
  imageKeys?: string[] | null;
  imageUrls?: string[] | null;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
};

export const noticesApi = {
  list() {
    return api<ApiResult<NoticeResponse[]> | NoticeResponse[]>(
      withApiBase('/notices')
    ).then((res) => unwrapApiResult(res));
  },

  async getById(noticeId: string): Promise<NoticeResponse | undefined> {
    try {
      const res = await api<ApiResult<NoticeResponse> | NoticeResponse>(
        withApiBase(`/notices/${noticeId}`)
      );
      const item = unwrapApiResult(res);
      return item ?? undefined;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  },
};
