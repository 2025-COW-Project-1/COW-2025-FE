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

// 개발 중에는 mock 쓰고, 나중에 백엔드 붙으면 .env.production에서 false로 바꿔서 실API 사용
const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV;

const mockProjects: Project[] = [
  {
    id: 'spring-keyring',
    title: '봄맞이 키링 프로젝트',
    summary: '학교 마스코트 컬러로 제작한 키링 굿즈',
    status: 'active',
    startAt: '2026-01-10',
    endAt: '2026-02-15',
    price: 7900,
    options: [
      { name: '컬러', values: ['네이비(#022964)', '오프화이트'] },
      { name: '고리', values: ['기본', '하트'] },
    ],
  },
  {
    id: 'sticker-pack',
    title: '스티커 팩 프로젝트',
    summary: '동아리 일러스트 스티커 6종 세트',
    status: 'upcoming',
    startAt: '2026-03-01',
    endAt: '2026-03-20',
    price: 5900,
  },
  {
    id: 'hoodie',
    title: '후드티 프로젝트',
    summary: '프리오더로 진행한 후드티 굿즈',
    status: 'closed',
    startAt: '2025-10-01',
    endAt: '2025-10-20',
    price: 39000,
    options: [{ name: '사이즈', values: ['S', 'M', 'L', 'XL'] }],
  },
];

// 혹시 다른 곳에서 바로 배열을 쓰고 싶을 수도 있어서 export도 해둠(선택)
export const projects = mockProjects;

export const projectsApi = {
  async list(): Promise<Project[]> {
    if (USE_MOCK) return mockProjects;

    // ⚠️ 백엔드에 /api/projects가 생기면 그대로 사용 가능
    return api<Project[]>('/api/projects');
  },

  async getById(id: string): Promise<Project | undefined> {
    if (USE_MOCK) return mockProjects.find((p) => p.id === id);

    // 백엔드에서 404면 api()가 throw할 수 있어서 undefined로 처리(페이지 로직 유지)
    try {
      return await api<Project>(`/api/projects/${id}`);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  },
};
