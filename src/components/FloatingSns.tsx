import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { snsApi } from '../api/sns';
import instagramLogo from '../assets/logos/instagram.png';
import kakaoLogo from '../assets/logos/kakao.png';

export default function FloatingSns() {
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
  const [kakaoUrl, setKakaoUrl] = useState<string | null>(null);

  const fetchLinks = useCallback(() => {
    let active = true;

    Promise.allSettled([snsApi.getInstagram(), snsApi.getKakao()])
      .then(([instagramResult, kakaoResult]) => {
        if (!active) return;
        const instagram =
          instagramResult.status === 'fulfilled' ? instagramResult.value : null;
        const kakao =
          kakaoResult.status === 'fulfilled' ? kakaoResult.value : null;
        setInstagramUrl(instagram?.url ?? null);
        setKakaoUrl(kakao?.url ?? null);
      })
      .catch(() => {
        if (!active) return;
        setInstagramUrl(null);
        setKakaoUrl(null);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = fetchLinks();

    const onUpdated = () => {
      fetchLinks();
    };

    window.addEventListener('sns-updated', onUpdated);
    return () => {
      cleanup?.();
      window.removeEventListener('sns-updated', onUpdated);
    };
  }, [fetchLinks]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <Link
        to="/notices"
        className="grid h-13 w-13 place-items-center rounded-full bg-white text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:scale-[1.03]"
        aria-label="공지사항"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      </Link>

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
