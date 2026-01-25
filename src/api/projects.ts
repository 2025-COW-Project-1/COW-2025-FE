import { api, withApiBase } from './client';

export type ProjectStatus = 'upcoming' | 'active' | 'closed';

export type ProjectOption = {
  name: string;
  values: string[];
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  startAt: string; // YYYY-MM-DD
  endAt: string; // YYYY-MM-DD
  price?: number;
  options?: ProjectOption[];
  description?: string;
  salesLink?: string;
  thumbnailMediaId?: number | null;
  imageMediaIds?: number[];
  sortOrder?: number;
  publishedAt?: string;
};

type ProjectResponse = {
  id: number;
  title: string;
  summary: string;
  description: string;
  basePrice: number;
  thumbnailMediaId: number | null;
  salesLink: string;
  sortOrder: number;
  publishedAt: string;
  imageMediaIds?: number[];
};

function toProject(item: ProjectResponse): Project {
  const publishedDate = item.publishedAt?.split('T')[0] ?? '';
  return {
    id: String(item.id),
    title: item.title,
    summary: item.summary,
    description: item.description,
    status: 'active',
    startAt: publishedDate,
    endAt: publishedDate,
    price: item.basePrice,
    salesLink: item.salesLink,
    thumbnailMediaId: item.thumbnailMediaId,
    imageMediaIds: item.imageMediaIds,
    sortOrder: item.sortOrder,
    publishedAt: item.publishedAt,
  };
}

export const projectsApi = {
  async list(): Promise<Project[]> {
    const data = await api<ProjectResponse[] | { data: ProjectResponse[] }>(
      withApiBase('/projects')
    );
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];
    return items.map(toProject);
  },

  async getById(id: string): Promise<Project | undefined> {
    try {
      const data = await api<ProjectResponse>(withApiBase(`/projects/${id}`));
      return toProject(data);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  },
};
