import { useEffect, useState } from 'react';
import { loadAdminContent, type AdminContent } from '../../utils/adminContent';
import { introApi, type IntroduceDetailPayload } from '../../api/intro';
import IntroduceDetailView from '../../features/introduce/IntroduceDetailView';

type IntroduceDetailViewModel = IntroduceDetailPayload;

type FallbackDetail = {
  brandTitle?: string;
  brandSubtitle?: string;
  introTitle?: string;
  introSlogan?: string;
  introBody?: string;
  purposeTitle?: string;
  purposeDescription?: string;
  currentLogoTitle?: string;
  currentLogoDescription?: string;
  currentLogoImageKey?: string;
  logoHistories?: Array<{
    year?: string;
    imageKey?: string;
    description?: string;
  }>;
};

export default function AboutPage() {
  const [content] = useState<AdminContent>(() => loadAdminContent());
  const [detail, setDetail] = useState<IntroduceDetailViewModel | null>(null);

  const fallback: FallbackDetail = {
    brandTitle: content.about.headline,
    brandSubtitle: content.about.subheadline,
    introTitle: content.about.headline,
    introSlogan: content.about.subheadline,
    introBody: content.about.intro.join('\n'),
    purposeTitle: content.about.purposeTitle,
    purposeDescription: content.about.purposeBody.join('\n'),
    currentLogoTitle: content.about.logoTitle,
    currentLogoDescription: content.about.logoBody.join('\n'),
    logoHistories: [],
  };

  useEffect(() => {
    let cancelled = false;

    introApi
      .getDetail()
      .then((data) => {
        if (cancelled) return;
        setDetail(data ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setDetail(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <IntroduceDetailView data={detail} fallback={fallback} />
    </div>
  );
}
