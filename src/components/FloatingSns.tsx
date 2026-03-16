import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { introApi } from '../api/intro';
import { snsApi } from '../api/sns';
import instagramLogo from '../assets/logos/instagram.png';
import kakaoLogo from '../assets/logos/kakao.png';

export default function FloatingSns() {
  const queryClient = useQueryClient();

  const { data: snsItemsData } = useQuery({
    queryKey: ['introduceSns'],
    queryFn: () => introApi.getSns(),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    placeholderData: (prev) => prev,
  });
  const { data: legacySnsData } = useQuery({
    queryKey: ['legacySns'],
    queryFn: async () => {
      const [instagramResult, kakaoResult] = await Promise.allSettled([
        snsApi.getInstagram(),
        snsApi.getKakao(),
      ]);

      return {
        instagramUrl:
          instagramResult.status === 'fulfilled'
            ? instagramResult.value?.url ?? null
            : null,
        kakaoUrl:
          kakaoResult.status === 'fulfilled' ? kakaoResult.value?.url ?? null : null,
      };
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    placeholderData: (prev) => prev,
  });

  const snsItems = useMemo(
    () => (Array.isArray(snsItemsData) ? snsItemsData : []),
    [snsItemsData],
  );

  useEffect(() => {
    const onUpdated = () => {
      void queryClient.invalidateQueries({ queryKey: ['introduceSns'] });
      void queryClient.invalidateQueries({ queryKey: ['legacySns'] });
    };

    window.addEventListener('sns-updated', onUpdated);
    return () => {
      window.removeEventListener('sns-updated', onUpdated);
    };
  }, [queryClient]);

  const { instagramUrl, kakaoUrl } = useMemo(() => {
    const normalize = (value?: string | null) => value?.toLowerCase() ?? '';
    const findUrl = (matcher: (entry: typeof snsItems[number]) => boolean) =>
      snsItems.find((entry) => entry.url && matcher(entry))?.url ?? null;

    const instagram = findUrl((entry) => {
      const type = normalize(entry.type);
      const title = normalize(entry.title);
      const iconKey = normalize(entry.iconKey);
      return (
        type.includes('instagram') ||
        type.includes('insta') ||
        title.includes('instagram') ||
        title.includes('인스타') ||
        iconKey.includes('instagram')
      );
    });

    const kakao = findUrl((entry) => {
      const type = normalize(entry.type);
      const title = normalize(entry.title);
      const iconKey = normalize(entry.iconKey);
      const url = normalize(entry.url);
      return (
        type.includes('kakao') ||
        type.includes('talk') ||
        title.includes('kakao') ||
        title.includes('카카오') ||
        iconKey.includes('kakao') ||
        url.includes('open.kakao.com') ||
        url.includes('pf.kakao.com')
      );
    });

    const instagramByUrl = findUrl((entry) =>
      normalize(entry.url).includes('instagram.com'),
    );
    const kakaoByUrl = findUrl((entry) => {
      const url = normalize(entry.url);
      return url.includes('open.kakao.com') || url.includes('pf.kakao.com');
    });

    return {
      instagramUrl:
        instagram ?? instagramByUrl ?? legacySnsData?.instagramUrl ?? null,
      kakaoUrl: kakao ?? kakaoByUrl ?? legacySnsData?.kakaoUrl ?? null,
    };
  }, [snsItems, legacySnsData?.instagramUrl, legacySnsData?.kakaoUrl]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="h-13 w-13 overflow-hidden rounded-full shadow-lg"
          aria-label="Instagram"
        >
          <img
            src={instagramLogo}
            alt="Instagram"
            className="h-full w-full rounded-full object-cover"
          />
        </a>
      )}

      {kakaoUrl && (
        <a
          href={kakaoUrl}
          target="_blank"
          rel="noreferrer"
          className="h-13 w-13 overflow-hidden rounded-full shadow-lg"
          aria-label="Kakao"
        >
          <img
            src={kakaoLogo}
            alt="Kakao"
            className="h-full w-full rounded-full object-cover"
          />
        </a>
      )}

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="h-13 w-13 rounded-full bg-[#002968] text-sm font-bold text-white shadow-lg"
      >
        TOP
      </button>
    </div>
  );
}
