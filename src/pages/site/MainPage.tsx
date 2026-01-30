import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import Reveal from '../../components/Reveal';
import { introApi, type IntroduceMainSummary } from '../../api/intro';

export default function MainPage() {
  const [introMain, setIntroMain] = useState<IntroduceMainSummary | null>(null);
  const [introLoading, setIntroLoading] = useState(true);
  const fetchedRef = useRef(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);

  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    introApi
      .getMain()
      .then((data) => setIntroMain(data ?? null))
      .catch(() => setIntroMain(null))
      .finally(() => setIntroLoading(false));
  }, []);

  const logos = useMemo(() => {
    return (introMain?.heroLogos ?? []).filter(
      (l) => (l.imageUrl ?? '').trim().length > 0
    );
  }, [introMain]);

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

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <Reveal className="space-y-6">
            {introLoading ? (
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
                {introMain?.title ? (
                  <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-5xl">
                    {introMain.title}
                  </h1>
                ) : null}

                {introMain?.subtitle ? (
                  <p className="text-base leading-relaxed text-slate-600">
                    {introMain.subtitle}
                  </p>
                ) : null}

                {introMain?.summary ? (
                  <div className="prose prose-slate max-w-none text-sm text-slate-600">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                      {introMain.summary}
                    </ReactMarkdown>
                  </div>
                ) : null}
              </>
            )}
          </Reveal>

          <Reveal delayMs={120} className="md:justify-self-end">
            {slides.length > 0 ? (
              <div className="w-full md:w-[520px]">
                <div className="relative overflow-hidden">
                  <div
                    ref={trackRef}
                    className="flex"
                    style={{
                      transform: `translateX(-${slideIndex * 100}%)`,
                      transition: enableTransition
                        ? 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)'
                        : 'none',
                    }}
                  >
                    {slides.map((logo, idx) => (
                      <div
                        key={`${logo.key ?? 'logo'}-${idx}`}
                        className="w-full shrink-0"
                      >
                        <Link
                          to="/about"
                          className="flex h-72 w-full items-center justify-center"
                          aria-label="로고 상세로 이동"
                        >
                          <img
                            src={logo.imageUrl ?? ''}
                            alt={`logo-${idx}`}
                            className="h-64 w-auto select-none object-contain"
                            draggable={false}
                          />
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
                </div>
              </div>
            ) : null}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl text-slate-900">
                (프젝 등록 예정~)
              </h2>
              <p className="mt-2 text-sm text-slate-600">~~~~~~~~~~</p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}