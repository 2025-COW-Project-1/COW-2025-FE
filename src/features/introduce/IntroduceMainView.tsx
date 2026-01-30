import { useEffect, useMemo, useRef, useState } from 'react';
import Reveal from '../../components/Reveal';
import type { IntroduceHeroLogo, IntroduceMainSummary } from '../../api/intro';
import ReactMarkdown from 'react-markdown';

type FallbackMain = {
  title?: string;
  subtitle?: string;
  summary?: string;
  heroLogos?: IntroduceHeroLogo[];
};

type Props = {
  data: IntroduceMainSummary | null;
  fallback?: FallbackMain;
  useReveal?: boolean;
};

function Markdown({ value }: { value?: string }) {
  if (!value) return null;
  return (
    <div className="prose prose-slate mt-6 max-w-none text-sm">
      <ReactMarkdown>{value}</ReactMarkdown>
    </div>
  );
}

export default function IntroduceMainView({ data, fallback, useReveal = true }: Props) {
  const hasData = data !== null;

  const title = hasData ? data?.title ?? '' : fallback?.title ?? '';
  const subtitle = hasData ? data?.subtitle ?? '' : fallback?.subtitle ?? '';
  const summary = hasData ? data?.summary ?? '' : fallback?.summary ?? '';

  const heroLogos = hasData && Array.isArray(data?.heroLogos) ? (data!.heroLogos ?? []) : [];
  const fallbackLogos =
    !hasData && Array.isArray(fallback?.heroLogos) ? (fallback!.heroLogos ?? []) : [];

  const logos = useMemo(
    () =>
      (heroLogos.length > 0 ? heroLogos : fallbackLogos).filter(
        (l) => (l.imageUrl ?? '').trim().length > 0
      ),
    [heroLogos, fallbackLogos]
  );

  const duplicated = useMemo(() => {
    if (logos.length <= 1) return logos;
    return [...logos, ...logos];
  }, [logos]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNavState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < max - 2);
  };

  const scrollByOne = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;

    const item = el.querySelector<HTMLElement>('[data-logo-item="true"]');
    const gap = 24;
    const step = item ? item.offsetWidth + gap : 160;

    el.scrollTo({
      left: el.scrollLeft + step * dir,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateNavState();
    const onScroll = () => updateNavState();
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [duplicated.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (logos.length <= 1) return;

    const tick = () => {
      const node = scrollerRef.current;
      if (!node) return;

      if (!pausedRef.current) {
        const half = node.scrollWidth / 2;
        const next = node.scrollLeft + 0.5;

        if (next >= half) {
          node.scrollLeft = next - half;
        } else {
          node.scrollLeft = next;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [logos.length]);

  const Content = (
    <div className="rounded-3xl border border-slate-200 bg-white p-8">
      <h1 className="font-heading text-3xl text-primary">{title}</h1>

      {subtitle ? <p className="mt-3 text-slate-700">{subtitle}</p> : null}
      {summary ? <Markdown value={summary} /> : null}

      {logos.length > 0 ? (
        <div className="mt-8">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => scrollByOne(-1)}
              disabled={!canPrev}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40"
              aria-label="이전 로고"
            >
              이전
            </button>
            <button
              type="button"
              onClick={() => scrollByOne(1)}
              disabled={!canNext}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40"
              aria-label="다음 로고"
            >
              다음
            </button>
          </div>

          <div
            ref={scrollerRef}
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
            onPointerDown={() => (pausedRef.current = true)}
            onPointerUp={() => (pausedRef.current = false)}
            onPointerCancel={() => (pausedRef.current = false)}
            className="mt-4 flex gap-6 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {duplicated.map((logo, idx) => (
              <div
                key={`${logo.key ?? 'logo'}-${idx}`}
                data-logo-item="true"
                className="shrink-0"
                title={logo.key}
              >
                <img
                  src={logo.imageUrl ?? ''}
                  alt={`logo-${idx}`}
                  className="h-14 w-auto select-none object-contain"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (!useReveal) return Content;
  return <Reveal>{Content}</Reveal>;
}