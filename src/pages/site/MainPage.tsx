import { useEffect, useRef, useState } from 'react';
import Reveal from '../../components/Reveal';
import { introApi, type IntroduceMainSummary } from '../../api/intro';
import IntroduceMainView from '../../features/introduce/IntroduceMainView';

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
      <IntroduceMainView data={introMain} loading={introLoading} variant="public" linkToAbout />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl text-slate-900">(프젝 등록 예정~)</h2>
              <p className="mt-2 text-sm text-slate-600">~~~~~~~~~~</p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}