import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { adminFormsApi, type AdminFormListItem } from '../../api/adminForms';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/toast/useToast';

export default function AdminFormsListPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [list, setList] = useState<AdminFormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFormsApi.list();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError(
        '모집 Form 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDeleteForm = async (form: AdminFormListItem) => {
    const ok = window.confirm(
      `"${form.title}" 폼을 삭제할까요?\n활성 폼이거나 지원서가 있으면 삭제할 수 없습니다.`,
    );
    if (!ok) return;

    setDeletingFormId(form.formId);

    try {
      await adminFormsApi.deleteForm(String(form.formId));
      setList((prev) => prev.filter((x) => x.formId !== form.formId));
      toast.success('폼을 삭제했어요.');
    } catch (e) {
      if (e instanceof ApiError && (e.status === 400 || e.status === 403)) {
        toast.error('지원서가 존재하는 폼은 삭제할 수 없습니다.');
      } else {
        toast.error(
          e instanceof Error
            ? e.message
            : '폼 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.',
        );
      }
    } finally {
      setDeletingFormId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl text-primary">
              모집 Form 관리
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              모집 Form을 만들고 문항/안내문을 설정할 수 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/forms/new')}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-95"
          >
            + Form 만들기
          </button>
        </div>
      </Reveal>

      <Reveal
        delayMs={120}
        className="mx-auto mt-6 max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
      >
        {loading && (
          <p className="py-8 text-center text-sm text-slate-500">
            불러오는 중...
          </p>
        )}

        {error && (
          <p className="py-4 text-sm font-semibold text-rose-600">{error}</p>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">
            <p className="font-semibold">아직 등록된 모집 Form이 없어요.</p>
            <p className="mt-2 text-xs text-slate-400">
              오른쪽 상단의 + Form 만들기 버튼으로 추가해 주세요.
            </p>
            <button
              type="button"
              onClick={() => navigate('/admin/forms/new')}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-95"
            >
              + Form 만들기
            </button>
          </div>
        )}

        {!loading && !error && list.length > 0 && (
          <div className="grid gap-4">
            {list.map((form) => {
              const isDeleting = deletingFormId === form.formId;

              return (
                <div
                  key={form.formId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-900">
                      {form.title}
                    </span>
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-semibold',
                        form.open
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500',
                      ].join(' ')}
                    >
                      {form.open ? 'OPEN' : 'CLOSE'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/applications?formId=${form.formId}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      지원서
                    </Link>
                    <Link
                      to={`/admin/forms/${form.formId}`}
                      className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      문항·안내문 관리
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDeleteForm(form)}
                      disabled={isDeleting}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                    >
                      {isDeleting ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Reveal>
    </div>
  );
}
