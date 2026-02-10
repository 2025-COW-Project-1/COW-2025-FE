import { api, withApiBase } from './client';
import { unwrapApiResult } from './types';
import type { ApiResult } from './types';

export type ItemSaleType = 'NORMAL' | 'GROUPBUY';
export type ItemStatus = 'PREPARING' | 'OPEN' | 'CLOSED';
export type ItemType = 'PHYSICAL' | 'DIGITAL_JOURNAL';

export type ItemResponse = {
  id: number | string;
  projectId?: number | string | null;
  itemType?: ItemType | null;
  name: string;
  summary?: string | null;
  description?: string | null;
  price: number;
  saleType: ItemSaleType;
  status: ItemStatus;
  thumbnailUrl?: string | null;
  thumbnailKey?: string | null;
  targetQty?: number | null;
  fundedQty?: number | null;
  stockQty?: number | null;
  remainingQty?: number | null;
  achievementRate?: number | null;
};

export type ItemJournalDownloadResponse = {
  downloadUrl: string;
  expiresInSeconds?: number;
};

export const itemsApi = {
  listByProject(projectId: string) {
    return api<ApiResult<ItemResponse[]> | ItemResponse[]>(
      withApiBase(`/projects/${projectId}/items`),
    ).then((res) => unwrapApiResult(res));
  },

  async getById(projectId: string, itemId: string) {
    try {
      return await api<ApiResult<ItemResponse> | ItemResponse>(
        withApiBase(`/projects/${projectId}/items/${itemId}`),
      ).then((res) => unwrapApiResult(res));
    } catch {
      return api<ApiResult<ItemResponse> | ItemResponse>(
        withApiBase(`/items/${itemId}`),
      ).then((res) => unwrapApiResult(res));
    }
  },

  getJournalDownloadUrl(itemId: string) {
    return api<
      ApiResult<ItemJournalDownloadResponse> | ItemJournalDownloadResponse
    >(withApiBase(`/items/${itemId}/journal/presign-get`), {
      method: 'POST',
    }).then((res) => unwrapApiResult(res));
  },
};
