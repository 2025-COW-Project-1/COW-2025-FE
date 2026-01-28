import { useEffect, useMemo, useRef, useState } from 'react';
import Reveal from '../../components/Reveal';
import mjucraftLogo from '../../assets/mjucraftLogo.png';
import { loadAdminContent, type AdminContent } from '../../utils/adminContent';
import {
  introApi,
  type IntroduceDetailSection,
} from '../../api/intro';

type DetailSectionView = {
  id: string;
  title: string;
  subtitle?: string;
  body: string[];
};

function normalizeSectionBody(section: IntroduceDetailSection): string[] {
  const raw =
    section.body ??
    section.content ??
    section.contents ??
    section.description ??
    section.summary ??
    '';
  if (Array.isArray(raw)) {
    return raw.filter((line) => typeof line === 'string') as string[];
  }
  if (typeof raw === 'string') {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

function buildFallbackSections(content: AdminContent): DetailSectionView[] {
  return [
    {
      id: 'purpose',
      title: content.about.purposeTitle,
      body: content.about.purposeBody,
    },
    {
      id: 'logo',
      title: content.about.logoTitle,
      body: content.about.logoBody,
    },
  ];
}

function toDetailSections(
  sections: IntroduceDetailSection[] | undefined
): DetailSectionView[] {
  if (!sections || sections.length === 0) return [];
  return sections
    .slice()
    .sort(
      (a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0)
    )
    .map((section, index) => ({
      id: String(section.id ?? `${index}`),
      title: section.title ?? 'Section',
      subtitle: section.subtitle ?? section.subTitle,
      body: normalizeSectionBody(section),
    }));
}

export default function AboutPage() {
  const [content] = useState<AdminContent>(() => loadAdminContent());
  const fetchedRef = useRef(false);
  const [detailSections, setDetailSections] = useState<DetailSectionView[]>([]);
  const fallbackSections = useMemo(
    () => buildFallbackSections(content),
    [content]
  );
  const renderedSections = detailSections.length
    ? detailSections
    : fallbackSections;
  const hasDetailSections = detailSections.length > 0;

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    let active = true;
  
    introApi
      .getDetail()
      .then((detail) => {
        if (!active) return;
        if (detail?.sections) {
          setDetailSections(toDetailSections(detail.sections));
        } else {
          setDetailSections([]);
        }
      })
      .catch(() => {
        if (!active) return;
        setDetailSections([]);
      });
  
    return () => {
      active = false;
    };
  }, []);  

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <h1 className="font-heading text-3xl text-primary">
              {content.about.headline}
            </h1>
            <p className="mt-3 text-slate-700">{content.about.subheadline}</p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              {content.about.intro.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
            <img
              src={mjucraftLogo}
              alt="(여기 한글 alt는 네 기존 문구 유지)"
              className="mx-auto h-40 w-90 rounded-2xl bg-slate-50 object-contain"
            />
            <p className="mt-4 text-sm font-bold text-slate-700">
              {content.about.footerNote}
            </p>
          </div>
        </div>
      </Reveal>

      {hasDetailSections && (
        <Reveal delayMs={80} className="mt-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {renderedSections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Section {index + 1}
                </div>
                <h2 className="mt-3 font-heading text-xl text-slate-900">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {section.subtitle}
                  </p>
                )}
                {section.body.length > 0 && (
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {section.body.map((line, idx) => (
                      <p key={`${section.id}-${idx}`}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {!hasDetailSections && (
        <>
          <Reveal delayMs={80} className="mt-12 rounded-3xl bg-white p-8">
            <h2 className="font-heading text-xl text-slate-900">
              {content.about.purposeTitle}
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
              {content.about.purposeBody.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delayMs={120} className="mt-10 rounded-3xl bg-white p-8">
            <h2 className="font-heading text-xl text-slate-900">
              {content.about.logoTitle}
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {content.about.logoBody.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
