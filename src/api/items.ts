import { api, withApiBase } from './client';
import { unwrapApiResult } from './types';
import type { ApiResult } from './types';

export type ItemSaleType = 'NORMAL' | 'GROUPBUY';
export type ItemStatus = 'PREPARING' | 'OPEN' | 'CLOSED';

export type ItemResponse = {
  id: number | string;
  projectId?: number | string | null;
  name: string;
  summary?: string | null;
  description?: string | null;
  price: number;
  saleType: ItemSaleType;
  status: ItemStatus;
  thumbnailUrl?: string | null;
  thumbnailKey?: string | null;
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
    } catch (err) {
      return api<ApiResult<ItemResponse> | ItemResponse>(
        withApiBase(`/items/${itemId}`),
      ).then((res) => unwrapApiResult(res));
    }
  },
};
