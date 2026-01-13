import { api } from './client';
import type { AdminContent, ProjectIntro } from '../utils/adminContent';

type IntroResponse = {
  about?: Partial<AdminContent['about']>;
  links?: Partial<AdminContent['links']>;
  projectsIntro?: ProjectIntro[];
  projects?: ProjectIntro[];
};

function mergeAbout(
  fallback: AdminContent['about'],
  incoming?: Partial<AdminContent['about']>
): AdminContent['about'] {
  if (!incoming) return fallback;
  return {
    headline: incoming.headline ?? fallback.headline,
    subheadline: incoming.subheadline ?? fallback.subheadline,
    intro: incoming.intro ?? fallback.intro,
    purposeTitle: incoming.purposeTitle ?? fallback.purposeTitle,
    purposeBody: incoming.purposeBody ?? fallback.purposeBody,
    logoTitle: incoming.logoTitle ?? fallback.logoTitle,
    logoBody: incoming.logoBody ?? fallback.logoBody,
    footerNote: incoming.footerNote ?? fallback.footerNote,
  };
}

export function normalizeIntroResponse(
  response: IntroResponse,
  fallback: AdminContent
): AdminContent {
  return {
    ...fallback,
    about: mergeAbout(fallback.about, response.about),
    links: {
      instagramUrl: response.links?.instagramUrl ?? fallback.links.instagramUrl,
      kakaoUrl: response.links?.kakaoUrl ?? fallback.links.kakaoUrl,
    },
    projectsIntro:
      response.projectsIntro ??
      response.projects ??
      fallback.projectsIntro,
  };
}

export const introApi = {
  getIntro() {
    return api<IntroResponse>('/api/intro');
  },
};
