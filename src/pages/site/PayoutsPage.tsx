import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { ApiError } from '../../api/client';
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
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full border border-slate-200 px-4 py-2 text-sm font-bold transition-colors',
        active
          ? 'bg-primary text-white'
          : 'bg-white text-slate-700 hover:bg-slate-100',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function PayoutContent({ report }: { report: PayoutReport }) {
  const c = calcReport(report);

  return (
    <Reveal
      delayMs={90}
      className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div className="text-lg font-bold text-slate-900">
          {report.projectTitle}
        </div>
        <div className="mt-1 text-sm text-slate-600">{report.term}</div>
      </div>

      <div className="px-5 pb-6 pt-5 text-sm text-slate-700">
        <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-700">요약</div>
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
              <div className="text-lg font-bold text-slate-900">매출</div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                {money(sumItems(report.sales))}
              </span>
            </div>

            {report.sales.length === 0 ? (
              <div className="mt-2 text-sm text-slate-500">
                등록된 항목이 없어요.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {report.sales.map((it, idx) => (
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
              <div className="text-lg font-bold text-slate-900">지출</div>
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                {money(c.expenseTotal)}
              </span>
            </div>

            {report.expenseGroups.length === 0 ? (
              <div className="mt-2 text-sm text-slate-500">
                등록된 항목이 없어요.
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {report.expenseGroups.map((g, groupIdx) => {
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

          {report.footerNote && (
            <div className="mt-6 text-xs text-slate-500">
              * {report.footerNote}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export default function PayoutsPage() {
  const [searchParams] = useSearchParams();
  const projectId = (searchParams.get('projectId') ?? '').trim();
  const isProjectMode = projectId.length > 0;

  const [reports, setReports] = useState<PayoutReport[]>([]);
  const [projectReport, setProjectReport] = useState<PayoutReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState<'all' | string>('all');

  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isProjectMode) {
        const detail = await payoutsApi.getByProjectId(projectId);
        if (!mountedRef.current) return;
        setProjectReport(detail);
        setReports([]);
      } else {
        const data = await payoutsApi.list();
        if (!mountedRef.current) return;
        setReports(data);
        setProjectReport(null);
      }
    } catch (e) {
      if (!mountedRef.current) return;

      if (e instanceof ApiError && isProjectMode) {
        if (e.status === 404) {
          setError('등록된 정산 내역이 없습니다.');
        } else if (e.status === 403) {
          setError('마감된 프로젝트만 정산을 확인할 수 있습니다.');
        } else {
          setError(e.message || '정산 내역을 불러오지 못했습니다.');
        }
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isProjectMode, projectId]);

  useEffect(() => {
    mountedRef.current = true;
    void load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [projectId]);

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
              {isProjectMode
                ? '프로젝트 정산 내역입니다.'
                : '학기별 정산 내역을 확인할 수 있어요.'}
            </p>
          </div>

          {isProjectMode && (
            <Link
              to={projectId ? `/projects/${projectId}` : '/projects'}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              프로젝트로 돌아가기
            </Link>
          )}
        </div>
      </Reveal>

      {!isProjectMode && (
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
      )}

      {loading && (
        <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
          정산 내역 불러오는 중...
        </Reveal>
      )}

      {!loading && error && (
        <Reveal className="mt-6 rounded-3xl border border-rose-200 bg-white p-8">
          <div className="text-sm font-bold text-rose-700">{error}</div>
          <button
            onClick={() => void load()}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            다시 시도
          </button>
        </Reveal>
      )}

      {!loading && !error && isProjectMode && !projectReport && (
        <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
          연결된 정산 내역이 없습니다.
        </Reveal>
      )}

      {!loading && !error && isProjectMode && projectReport && (
        <PayoutContent report={projectReport} />
      )}

      {!loading && !error && !isProjectMode && filtered.length === 0 && (
        <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
          등록된 정산 내역이 없어요.
        </Reveal>
      )}

      {!loading && !error && !isProjectMode && filtered.length > 0 && (
        <div className="mt-8 space-y-4">
          {filtered.map((report) => (
            <PayoutContent key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
