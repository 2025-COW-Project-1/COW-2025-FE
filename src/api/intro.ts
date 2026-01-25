import { api, withApiBase } from './client';
import type { AdminContent } from '../utils/adminContent';

type IntroduceInfoResponse = Partial<AdminContent['about']>;
type IntroduceSnsResponse = Partial<AdminContent['links']>;

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

export function normalizeIntroduceResponses(
  info: IntroduceInfoResponse | undefined,
  sns: IntroduceSnsResponse | undefined,
  fallback: AdminContent
): AdminContent {
  return {
    ...fallback,
    about: mergeAbout(fallback.about, info),
    links: {
      instagramUrl: sns?.instagramUrl ?? fallback.links.instagramUrl,
      kakaoUrl: sns?.kakaoUrl ?? fallback.links.kakaoUrl,
    },
    projectsIntro: fallback.projectsIntro,
  };
}

export const introApi = {
  getInformation() {
    return api<IntroduceInfoResponse>(withApiBase('/introduce/information'));
  },

  getSns() {
    return api<IntroduceSnsResponse>(withApiBase('/introduce/sns'));
  },
};
