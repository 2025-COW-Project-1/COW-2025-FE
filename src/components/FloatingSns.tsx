import { useEffect, useState } from 'react';
import { introApi, type IntroduceSnsItem } from '../api/intro';

function toSnsKind(value?: string) {
  const v = (value ?? '').toLowerCase();
  if (v.includes('insta')) return 'instagram';
  if (v.includes('kakao')) return 'kakao';
  return 'link';
}

export default function FloatingSns() {
  const [snsLinks, setSnsLinks] = useState<IntroduceSnsItem[]>([]);

  useEffect(() => {
    introApi
      .getSns()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const sorted = list
          .filter((item) => item && (item.active ?? true))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setSnsLinks(sorted);
      })
      .catch(() => setSnsLinks([]));
  }, []);

  const instagram = snsLinks.find((l) => toSnsKind(l.iconKey ?? l.type) === 'instagram');
// const kakao = snsLinks.find((l) => toSnsKind(l.iconKey ?? l.type) === 'kakao');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* 인스타그램 아이콘 */}
      {instagram?.url && (
        <a
        href={instagram.url}
        target="_blank"
        rel="noreferrer"
        className="h-15 w-15 overflow-hidden rounded-full shadow-lg"
        aria-label="Instagram"
      >
        <img
          src="/src/assets/logos/instagram.png"
          alt="Instagram"
          className="h-full w-full rounded-full object-cover"
        />
      </a>
      
      )}
  
      {/* 카카오톡 아이콘 (링크는 아직 없음) */}
      <button
        type="button"
        className="h-15 w-15 overflow-hidden border border-slate-200  rounded-full shadow-lg"
        aria-label="KakaoTalk"
      >
        <img
          src="/src/assets/logos/kakao.png"
          alt="KakaoTalk"
          className="h-full w-full object-cover"
        />
      </button>
  
      {/* TOP 버튼 */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="h-15 w-15 rounded-full bg-[#002968] text-sm font-bold text-white shadow-lg">
        TOP
      </button>
    </div>
  );  
}