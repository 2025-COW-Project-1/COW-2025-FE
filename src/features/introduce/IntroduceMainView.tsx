import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import Reveal from '../../components/Reveal';
import type { IntroduceMainSummary } from '../../api/intro';

type Props = {
  data: IntroduceMainSummary | null;
  loading?: boolean;
  fallback?: {
    title?: string;
    subtitle?: string;
    summary?: string;
  };
  useReveal?: boolean;
  variant?: 'public' | 'preview';
  linkToAbout?: boolean;
};

export default function IntroduceMainView({
  data,
  loading = false,
  fallback,
  useReveal = true,
  variant = 'public',
  linkToAbout = false,
}: Props) {
  const title = (data?.title ?? fallback?.title ?? '').trim();
  const subtitle = (data?.subtitle ?? fallback?.subtitle ?? '').trim();
  const summary = data?.summary ?? fallback?.summary ?? '';

  const logos = useMemo(() => {
    return (data?.heroLogos ?? []).filter((l) => (l?.imageUrl ?? '').trim().length > 0);
  }, [data]);

  const isPreview = variant === 'preview';

  const Container: any = useReveal ? Reveal : ({ children }: any) => children;

  if (isPreview) {
    const safeLogos = logos.slice(0, 8);
  
    const LogoItem = ({ src, alt }: { src: string; alt: string }) => {
      const img = (
        <img
          src={src}
          alt={alt}
          className="h-14 w-14 rounded-xl bg-white object-contain"
          draggable={false}
        />
      );
  
      if (!linkToAbout) return img;
  
      return (
        <Link to="/about" aria-label="소개 페이지로 이동" className="inline-flex">
          {img}
        </Link>
      );
    };
  
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
        </div>
  
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-6 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
            ) : (
              <div className="space-y-3 min-w-0">
                {title ? (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">타이틀</div>
                    <h1 className="mt-1 font-heading text-base leading-tight tracking-tight text-slate-900 break-keep">
                      {title}
                    </h1>
                  </div>
                ) : null}
  
                {subtitle ? (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">서브타이틀</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 break-keep">{subtitle}</p>
                  </div>
                ) : null}
  
                {summary ? (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">요약</div>
                    <div className="mt-1 prose prose-slate max-w-none text-sm text-slate-600">
                      <ReactMarkdown remarkPlugins={[remarkBreaks]}>{summary}</ReactMarkdown>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
  
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-500">로고(최대 8개)</div>
              <div className="text-[11px] text-slate-400">{logos.length}개</div>
            </div>
  
            {safeLogos.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {safeLogos.map((logo, idx) => (
                  <LogoItem
                    key={`${logo.key ?? 'logo'}-${idx}`}
                    src={logo.imageUrl ?? ''}
                    alt={`logo-${idx}`}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-400">등록된 로고가 없어요.</div>
            )}
          </div>
        </div>
      </section>
    );
  }

  const [slideIndex, setSlideIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const slides = useMemo(() => {
    if (logos.length === 0) return [];
    if (logos.length === 1) return logos;
    return [...logos, logos[0]];
  }, [logos]);

  useEffect(() => {
    setSlideIndex(0);
    setEnableTransition(true);
  }, [logos.length]);

  useEffect(() => {
    if (logos.length <= 1) return;

    const id = window.setInterval(() => {
      setSlideIndex((prev) => prev + 1);
    }, 3200);

    return () => window.clearInterval(id);
  }, [logos.length]);

  useEffect(() => {
    if (logos.length <= 1) return;
    if (slideIndex !== logos.length) return;

    const handle = window.setTimeout(() => {
      setEnableTransition(false);
      setSlideIndex(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEnableTransition(true));
      });
    }, 920);

    return () => window.clearTimeout(handle);
  }, [slideIndex, logos.length]);

  const LogoWrap = ({ children }: { children: React.ReactNode }) => {
    if (!linkToAbout) return <>{children}</>;
    return (
      <Link to="/about" aria-label="로고 상세로 이동" className="flex h-72 w-full items-center justify-center">
        {children}
      </Link>
    );
  };

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr]">
        <Container className="space-y-6 min-w-0">
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-36 rounded bg-slate-200" />
                <div className="h-10 w-28 rounded bg-slate-200" />
              </div>
            </div>
          ) : (
            <>
              {title ? (
                <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-5xl break-keep">
                  {title}
                </h1>
              ) : null}

              {subtitle ? <p className="text-base leading-relaxed text-slate-600 break-keep">{subtitle}</p> : null}

              {summary ? (
                <div className="prose prose-slate max-w-none text-sm text-slate-600">
                  <ReactMarkdown remarkPlugins={[remarkBreaks]}>{summary}</ReactMarkdown>
                </div>
              ) : null}
            </>
          )}
        </Container>

        <Container delayMs={120} className="md:justify-self-end">
          {slides.length > 0 ? (
            <div className="w-full md:w-[520px]">
              <div className="relative overflow-hidden">
                <div
                  ref={trackRef}
                  className="flex"
                  style={{
                    transform: `translateX(-${slideIndex * 100}%)`,
                    transition: enableTransition ? 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
                  }}
                >
                  {slides.map((logo, idx) => (
                    <div key={`${logo.key ?? 'logo'}-${idx}`} className="w-full shrink-0">
                      <LogoWrap>
                        <img
                          src={logo.imageUrl ?? ''}
                          alt={`logo-${idx}`}
                          className="h-64 w-auto max-w-full select-none object-contain"
                          draggable={false}
                        />
                      </LogoWrap>
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
              </div>
            </div>
          ) : null}
        </Container>
      </div>
    </section>
  );
}