import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import BackArrowIcon from '../../components/BackArrowIcon';
import { useConfirm } from '../../components/confirm/useConfirm';
import { useToast } from '../../components/toast/useToast';
import {
  adminApplicationsApi,
  type AdminApplicationDetail,
  type AdminApplicationResultStatus,
} from '../../api/adminApplications';
import { formatYmd, parseDateLike } from '../../utils/date';

const RESULT_OPTIONS: Array<{
  value: AdminApplicationResultStatus;
  label: string;
}> = [
  { value: 'NOT_PUBLISHED', label: '미발표' },
  { value: 'PASS', label: '합격' },
  { value: 'FAIL', label: '불합격' },
];

export default function AdminApplicationDetailPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const { formId, applicationId } = useParams();

  const [detail, setDetail] = useState<AdminApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!formId || !applicationId) return;
    setLoading(true);
    try {
      const data = await adminApplicationsApi.getById(formId, applicationId);
      setDetail(data ?? null);
    } finally {
      setLoading(false);
    }
  }, [applicationId, formId]);

  useEffect(() => {
    void load();
  }, [load]);

  const dateLabel = useMemo(() => {
    if (!detail) return '-';
    const date = parseDateLike(detail.updatedAt ?? detail.createdAt);
    return date ? formatYmd(date) : '-';
  }, [detail]);

  const handleResultUpdate = useCallback(
    async (status: AdminApplicationResultStatus) => {
      if (!detail) return;
      setSaving(true);
      try {
        await adminApplicationsApi.updateResult(String(detail.applicationId), {
          resultStatus: status,
        });
        toast.success('결과를 저장했어요');
        await load();
      } catch {
        toast.error('저장에 실패했어요');
      } finally {
        setSaving(false);
      }
    },
    [detail, load, toast],
  );

  const handleDelete = useCallback(async () => {
    if (!detail) return;
    const ok = await confirm.open({
      title: '지원서 삭제',
      description: `지원서(${detail.applicationId})를 삭제할까요?`,
      danger: true,
      confirmText: '삭제',
    });
    if (!ok) return;

    try {
      await adminApplicationsApi.delete(String(detail.applicationId));
      toast.success('삭제했어요');
      navigate(`/admin/applications?formId=${formId}`);
    } catch {
      toast.error('삭제에 실패했어요');
    }
  }, [confirm, detail, formId, navigate, toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">
        불러오는 중...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-rose-600">지원서를 찾을 수 없어요.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => navigate(`/admin/applications?formId=${formId}`)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
            >
              <BackArrowIcon className="h-5 w-5" />
              지원서 목록
            </button>
            <h1 className="mt-2 font-heading text-3xl text-primary">
              지원서 상세
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              지원서 정보를 확인하고 결과를 입력할 수 있어요
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50"
          >
            삭제
          </button>
        </div>
      </Reveal>

      <Reveal
        delayMs={120}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              #{detail.applicationId}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {detail.studentId}
            </p>
            <p className="mt-1 text-xs text-slate-500">{dateLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            {RESULT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={saving}
                onClick={() => void handleResultUpdate(opt.value)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-bold transition',
                  detail.resultStatus === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          1지망: {detail.firstDepartment} / 2지망: {detail.secondDepartment}
        </div>
      </Reveal>

      <Reveal
        delayMs={180}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-bold text-slate-700">공통 답변</h2>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              {(detail.commonAnswers ?? []).length === 0 ? (
                <p>답변이 없어요.</p>
              ) : (
                detail.commonAnswers?.map((ans) => (
                  <div
                    key={`common-${ans.formQuestionId}`}
                    className="rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="text-xs text-slate-400">
                      Q#{ans.formQuestionId}
                    </span>
                    <p className="mt-1">{ans.value ?? '-'}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-700">1지망 답변</h2>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              {(detail.firstDepartmentAnswers ?? []).length === 0 ? (
                <p>답변이 없어요.</p>
              ) : (
                detail.firstDepartmentAnswers?.map((ans) => (
                  <div
                    key={`first-${ans.formQuestionId}`}
                    className="rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="text-xs text-slate-400">
                      Q#{ans.formQuestionId}
                    </span>
                    <p className="mt-1">{ans.value ?? '-'}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-700">2지망 답변</h2>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              {(detail.secondDepartmentAnswers ?? []).length === 0 ? (
                <p>답변이 없어요.</p>
              ) : (
                detail.secondDepartmentAnswers?.map((ans) => (
                  <div
                    key={`second-${ans.formQuestionId}`}
                    className="rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="text-xs text-slate-400">
                      Q#{ans.formQuestionId}
                    </span>
                    <p className="mt-1">{ans.value ?? '-'}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </Reveal>
    </div>
  );
}
