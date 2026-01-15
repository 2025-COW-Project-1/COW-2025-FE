import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import ResourceCard from '../../components/ResourceCard';
import { resourcesApi } from '../../api/resources';
import type { ResourceItem, ResourceCategory } from '../../api/resources';

const CATEGORY_TABS: { label: string; value: ResourceCategory | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '저널', value: 'journal' },
  { label: '템플릿', value: 'template' },
];

export default function ResourcesPage() {
  const [sp, setSp] = useSearchParams();
  const category =
    (sp.get('category') as ResourceCategory | 'all' | null) ?? 'all';
  const year = sp.get('year');

  const [items, setItems] = useState<ResourceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resourcesApi
      .list()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const years = useMemo(() => {
    return Array.from(new Set(items.map((r) => r.year))).sort((a, b) => b - a);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const okCategory = category === 'all' ? true : r.category === category;
      const okYear = year ? String(r.year) === year : true;
      return okCategory && okYear;
    });
  }, [items, category, year]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-3xl text-primary">무료 배포</h1>
        <p className="mt-2 text-slate-600">
          저널/템플릿 자료를 연도별로 정리했어요.
        </p>
      </Reveal>

      <Reveal delayMs={80} className="mt-6 flex flex-wrap items-center gap-2">
        {CATEGORY_TABS.map((t) => {
          const active = category === t.value;
          return (
            <button
              key={t.value}
              onClick={() => {
                const next = new URLSearchParams(sp);
                if (t.value === 'all') next.delete('category');
                else next.set('category', t.value);
                setSp(next);
              }}
              className={[
                'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                'border border-slate-200',
                active
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}

        <div className="ml-auto">
          <select
            value={year ?? ''}
            onChange={(e) => {
              const next = new URLSearchParams(sp);
              if (!e.target.value) next.delete('year');
              else next.set('year', e.target.value);
              setSp(next);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none hover:bg-slate-50"
          >
            <option value="">전체 연도</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}년
              </option>
            ))}
          </select>
        </div>
      </Reveal>

      {error && (
        <Reveal className="mt-6 rounded-2xl border border-rose-200 bg-white p-4 text-sm font-bold text-rose-700">
          리소스 로드 실패: {error}
        </Reveal>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {filtered.length === 0 ? (
          <Reveal className="md:col-span-3 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
            조건에 맞는 자료가 없어요.
          </Reveal>
        ) : (
          filtered.map((r, i) => (
            <Reveal key={r.id} delayMs={i * 60}>
              <ResourceCard item={r} />
            </Reveal>
          ))
        )}
      </div>
    </div>
  );
}
