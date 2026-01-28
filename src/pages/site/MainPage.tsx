import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../../components/Reveal';
// import ProjectCard from '../../components/ProjectCard';
import mjucraftLogo from '../../assets/mjucraftLogo.png';
import { introApi, type IntroduceMainSummary } from '../../api/intro';

export default function MainPage() {
  const [introMain, setIntroMain] = useState<IntroduceMainSummary | null>(null);
  const [introLoading, setIntroLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
  
    introApi
      .getMain()
      .then((data) => setIntroMain(data ?? null))
      .catch(() => setIntroMain(null))
      .finally(() => setIntroLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2">
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
                {introMain?.title && (
                  <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-5xl">
                    {introMain.title}
                  </h1>
                )}

                {introMain?.subtitle && (
                  <p className="text-base leading-relaxed text-slate-600">
                    {introMain.subtitle}
                  </p>
                )}

                {introMain?.summary && (
                  <p className="text-sm font-medium text-slate-500">
                    {introMain.summary}
                  </p>
                )}
              </>
            )}
          </Reveal>

          <Reveal
            delayMs={120}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-10"
          >
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">
                (명지공방 로고 → S3 구현 예정)
              </div>
              <div className="mt-3 h-48 rounded-xl bg-slate-100">
                <Link to="/about">
                  <img
                    src={mjucraftLogo}
                    alt="mjucraft logo"
                    className="w-full h-full object-contain"
                  />
                </Link>
              </div>
            </div>
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
              <p className="mt-2 text-sm text-slate-600">
                ~~~~~~~~~~
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
