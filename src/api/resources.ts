import { api, withApiBase } from './client';

export type ResourceCategory = 'journal' | 'template';
export type ResourceLinkKind = 'folder' | 'file';

export type ResourceLink = {
  kind: ResourceLinkKind;
  label: string;
  url: string;
  isPrimary?: boolean;
};

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  year: number;
  links: ResourceLink[];
};

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV;

const mockResources: ResourceItem[] = [
  {
    id: 'journal-2026',
    title: '명지공방 저널 2026',
    description: '[MJU Journal]-2026 ver.',
    category: 'journal',
    year: 2026,
    links: [
      {
        kind: 'folder',
        label: '구글 드라이브 폴더',
        url: 'https://drive.google.com/drive/folders/1LhEAaOQAR4qGxUAu8bZEGA54WzO6c4Jp',
        isPrimary: true,
      },
      // 대표 PDF 링크가 생기면 아래처럼 추가하면 버튼이 자동으로 늘어남
      // { kind: 'file', label: '대표 PDF 보기', url: 'https://drive.google.com/file/d/FILE_ID/view', isPrimary: true },
    ],
  },
];

export const resources = mockResources;

export const resourcesApi = {
  async list(): Promise<ResourceItem[]> {
    if (USE_MOCK) return mockResources;
    return api<ResourceItem[]>(withApiBase('/resources'));
  },
};
