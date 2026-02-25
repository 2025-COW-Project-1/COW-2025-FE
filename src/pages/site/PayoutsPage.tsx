import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Reveal from '../../components/Reveal';
import {
  calcReport,
  getItemTotal,
  payoutsApi,
  sumItems,
} from '../../api/payouts';
import type { PayoutReport } from '../../types/payouts';

function money(n: number) {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sign}${abs.toLocaleString()}원`;
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full px-4 py-2 text-sm font-bold transition-colors',
        'border border-slate-200',
        active
          ? 'bg-primary text-white'
          : 'bg-white text-slate-700 hover:bg-slate-100',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function PayoutsPage() {
  const [reports, setReports] = useState<PayoutReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [term, setTerm] = useState<'all' | string>('all');
  const mountedRef = useRef(true);

  const load = useCallback(() => {
    payoutsApi
      .list()
      .then((data) => {
        if (!mountedRef.current) return;
        setReports(data);
        setError(null);
      })
      .catch((e) => {
        if (!mountedRef.current) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!mountedRef.current) return;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  const terms = useMemo(() => {
    const set = new Set(reports.map((r) => r.term));
    return Array.from(set).sort().reverse();
  }, [reports]);

  const filtered = useMemo(() => {
    if (term === 'all') return reports;
    return reports.filter((r) => r.term === term);
  }, [reports, term]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-primary">정산</h1>
            <p className="mt-2 text-slate-600">
              학기별 정산 내역을 확인할 수 있어요.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delayMs={60} className="mt-6 flex flex-wrap gap-2">
        <TabButton active={term === 'all'} onClick={() => setTerm('all')}>
          전체
        </TabButton>
        {terms.map((t) => (
          <TabButton key={t} active={term === t} onClick={() => setTerm(t)}>
            {t}
          </TabButton>
        ))}
      </Reveal>

      {loading && (
        <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
          정산 내역 불러오는 중...
        </Reveal>
      )}

      {!loading && error && (
        <Reveal className="mt-6 rounded-3xl border border-rose-200 bg-white p-8">
          <div className="text-sm font-bold text-rose-700">
            정산 내역을 불러오지 못했습니다. {error}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              load();
            }}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            다시 시도
          </button>
        </Reveal>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
          등록된 정산 내역이 없어요.
        </Reveal>
      )}

      {!loading && !error && filtered.length > 0 && (
        <Reveal
          delayMs={90}
          className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white"
        >
          <div className="hidden grid-cols-10 gap-0 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 md:grid">
            <div className="col-span-4">프로젝트명</div>
            <div className="col-span-2">학기</div>
            <div className="col-span-2 text-right">매출</div>
            <div className="col-span-2 text-right">지출</div>
          </div>

          {filtered.map((r) => {
            const c = calcReport(r);

            return (
              <details
                key={r.id}
                className="group border-b border-slate-200 last:border-b-0"
              >
                <summary className="cursor-pointer list-none px-5 py-4 text-sm [&::-webkit-details-marker]:hidden">
                  <div className="hidden items-center md:grid md:grid-cols-10">
                    <div className="col-span-4">
                      <div className="font-bold text-slate-900">
                        {r.projectTitle}
                      </div>
                    </div>

                    <div className="col-span-2 text-slate-700">{r.term}</div>

                    <div className="col-span-2 text-right font-semibold text-emerald-600">
                      {money(c.salesTotal)}
                    </div>

                    <div className="col-span-2 text-right font-semibold text-rose-600">
                      {money(c.expenseTotal)}
                    </div>
                  </div>

                  <div className="md:hidden">
                    <div className="min-w-0 pl-1">
                      <div className="text-base font-bold text-slate-900">
                        {r.projectTitle}
                      </div>
                    </div>

                    <div className="mt-2 flex items-start justify-between gap-3">
                      <span className="mt-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600">
                        {r.term}
                      </span>

                      <div className="grid grid-cols-2 gap-3 text-xs text-right">
                        <div className="text-emerald-700">
                          <div className="text-[10px]">매출</div>
                          <div className="font-semibold leading-tight">
                            {money(c.salesTotal)}
                          </div>
                        </div>
                        <div className="text-rose-700">
                          <div className="text-[10px]">지출</div>
                          <div className="font-semibold leading-tight">
                            {money(c.expenseTotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </summary>

                <div className="px-5 pb-6 text-sm text-slate-700">
                  <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-4 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/60" />
                        <div className="text-sm font-bold text-slate-700">
                          요약
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400">단위: 원</div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <div className="text-[10px] text-slate-500">매출</div>
                        <div className="text-sm font-bold text-emerald-600">
                          {money(c.salesTotal)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <div className="text-[10px] text-slate-500">지출</div>
                        <div className="text-sm font-bold text-rose-600">
                          {money(c.expenseTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <div className="font-heading text-lg text-slate-900">
                          매출
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          {money(sumItems(r.sales))}
                        </span>
                      </div>

                      {r.sales.length === 0 ? (
                        <div className="mt-2 text-sm text-slate-500">
                          등록된 항목이 없어요.
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {r.sales.map((it, idx) => (
                            <div
                              key={String(it.id ?? `${it.label}-${idx}`)}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            >
                              <div className="text-sm font-medium text-slate-700">
                                {it.label}
                              </div>
                              <div className="text-sm font-bold text-slate-900">
                                {money(getItemTotal(it))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center justify-between">
                        <div className="font-heading text-lg text-slate-900">
                          지출
                        </div>
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                          {money(c.expenseTotal)}
                        </span>
                      </div>

                      {r.expenseGroups.length === 0 ? (
                        <div className="mt-2 text-sm text-slate-500">
                          등록된 항목이 없어요.
                        </div>
                      ) : (
                        <div className="mt-3 space-y-4">
                          {r.expenseGroups.map((g, groupIdx) => {
                            const gTotal = sumItems(g.items);
                            return (
                              <div
                                key={`${g.title}-${groupIdx}`}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-base font-bold text-slate-900">
                                    {g.title}
                                  </div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {money(gTotal)}
                                  </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                  {g.items.map((it, itemIdx) => (
                                    <div
                                      key={`${g.title}-${String(it.id ?? `${it.label}-${itemIdx}`)}`}
                                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 shadow-sm"
                                    >
                                      <div className="text-sm text-slate-700">
                                        {it.label}
                                      </div>
                                      <div className="text-sm font-semibold text-slate-900">
                                        {money(getItemTotal(it))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {r.footerNote && (
                      <div className="mt-6 text-xs text-slate-500">
                        * {r.footerNote}
                      </div>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </Reveal>
      )}
    </div>
  );
}
