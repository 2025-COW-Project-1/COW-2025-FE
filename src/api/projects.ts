import { api } from './client';

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
};

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV;

const mockProjects: Project[] = [
  {
    id: 'baby-maru-keyring',
    title: '베이비마루 인형 키링',
    summary: '명지대학교 마스코트의 아기 버전',
    status: 'active',
    startAt: '2025-09-01',
    endAt: '2026-02-15',
    price: 21000,
    options: [
      { name: '패키징 O(+1,000원)', values: ['상자', '포장', '키체인'] },
      { name: '패키징 X', values: ['현장수령'] },
    ],
  },
  {
    id: 'test1',
    title: 'test1',
    summary: 'test1',
    status: 'upcoming',
    startAt: '2026-03-01',
    endAt: '2026-03-20',
    price: 5900,
  },
  {
    id: 'test2',
    title: 'test2',
    summary: 'test2',
    status: 'closed',
    startAt: '2025-10-01',
    endAt: '2025-10-20',
    price: 39000,
  },
];

export const projects = mockProjects;

export const projectsApi = {
  async list(): Promise<Project[]> {
    if (USE_MOCK) return mockProjects;
    return api<Project[]>('/api/projects');
  },

  async getById(id: string): Promise<Project | undefined> {
    if (USE_MOCK) return mockProjects.find((p) => p.id === id);

    try {
      return await api<Project>(`/api/projects/${id}`);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  },
};
