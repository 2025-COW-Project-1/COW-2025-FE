import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { useConfirm } from '../../components/confirm/useConfirm';
import { useToast } from '../../components/toast/useToast';
import {
  adminApplicationsApi,
  type AdminApplicationListItem,
  type AdminApplicationResultStatus,
} from '../../api/adminApplications';
import { formatYmd, parseDateLike } from '../../utils/date';

const RESULT_OPTIONS: Array<{
  value: AdminApplicationResultStatus | 'all';
  label: string;
}> = [
  { value: 'all', label: '전체' },
  { value: 'NOT_PUBLISHED', label: '미발표' },
  { value: 'PASS', label: '합격' },
  { value: 'FAIL', label: '불합격' },
];

type SortOrder = 'desc' | 'asc';

export default function AdminApplicationsListPage() {
  const confirm = useConfirm();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [formId, setFormId] = useState(params.get('formId') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<AdminApplicationListItem[]>([]);

  const [query, setQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<
    'all' | AdminApplicationResultStatus
  >('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const load = useCallback(async (targetFormId: string) => {
    if (!targetFormId.trim()) {
      setList([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await adminApplicationsApi.list(targetFormId.trim());
      setList(data ?? []);
    } catch (err) {
      console.error(err);
      setError('지원서 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const existing = params.get('formId') ?? '';
    if (existing) void load(existing);
  }, [load, params]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const next = list.filter((item) => {
      if (resultFilter !== 'all' && item.resultStatus !== resultFilter)
        return false;
      if (!normalized) return true;
      return (
        item.studentId.toLowerCase().includes(normalized) ||
        String(item.applicationId).includes(normalized)
      );
    });

    return next.sort((a, b) => {
      const da = parseDateLike(a.updatedAt ?? a.createdAt);
      const db = parseDateLike(b.updatedAt ?? b.createdAt);
      const diff = (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
      return sortOrder === 'desc' ? diff : -diff;
    });
  }, [list, query, resultFilter, sortOrder]);

  const handleSearch = useCallback(() => {
    const next = formId.trim();
    setParams((prev) => {
      const copy = new URLSearchParams(prev);
      if (next) copy.set('formId', next);
      else copy.delete('formId');
      return copy;
    });
    void load(next);
  }, [formId, load, setParams]);

  const handleDelete = useCallback(
    async (item: AdminApplicationListItem) => {
      const ok = await confirm.open({
        title: '지원서 삭제',
        description: `지원서(${item.applicationId})를 삭제할까요?`,
        danger: true,
        confirmText: '삭제',
      });
      if (!ok) return;

      try {
        await adminApplicationsApi.delete(String(item.applicationId));
        toast.success('삭제했어요');
        const currentFormId = params.get('formId') ?? '';
        if (currentFormId) await load(currentFormId);
      } catch {
        toast.error('삭제에 실패했어요');
      }
    },
    [confirm, load, params, toast],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl text-primary">지원서 관리</h1>
            <p className="mt-2 text-sm text-slate-600">
              formId로 지원서 목록을 조회하고 결과를 입력할 수 있어요
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal
        delayMs={120}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
            placeholder="formId 입력"
            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 md:w-64"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-95"
          >
            조회
          </button>

          <div className="flex w-full flex-col gap-2 md:flex-1 md:flex-row md:items-center md:justify-end">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="학번/지원서ID 검색"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 md:w-64"
            />
            <select
              value={resultFilter}
              onChange={(e) =>
                setResultFilter(
                  e.target.value as AdminApplicationResultStatus | 'all',
                )
              }
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              {RESULT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된순</option>
            </select>
          </div>
        </div>
      </Reveal>

      <Reveal
        delayMs={180}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {loading && <p className="text-sm text-slate-500">불러오는 중...</p>}
        {error && (
          <p className="text-sm font-semibold text-rose-600">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            조회된 지원서가 없어요.
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {filtered.map((item) => {
            const date = formatYmd(item.updatedAt ?? item.createdAt);
            return (
              <div
                key={item.applicationId}
                className="flex items-center gap-4 py-4"
              >
                <div className="w-24 text-xs font-semibold text-slate-500">
                  #{item.applicationId}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    {item.studentId}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{date}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    1지망: {item.firstDepartment} / 2지망:{' '}
                    {item.secondDepartment}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {item.resultStatus}
                </span>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/applications/${params.get('formId')}/${item.applicationId}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    상세
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
