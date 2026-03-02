import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { useConfirm } from '../../components/confirm/useConfirm';
import { useToast } from '../../components/toast/useToast';
import { ApiError } from '../../api/client';
import {
  adminFormsApi,
  type AdminFormDetail,
  type AdminFormListItem,
  type AdminFormQuestion,
  type AdminFormNoticeItem,
  type AdminFormQuestionCreateRequest,
  type AdminFormNoticeCreateRequest,
} from '../../api/adminForms';
import { DEPARTMENT_OPTIONS, getDepartmentLabel } from '../../types/recruit';

const ANSWER_TYPES = ['TEXT', 'SELECT', 'FILE'] as const;
const SECTION_TYPES = ['COMMON', 'DEPARTMENT'] as const;

const defaultQuestionPayload = (
  order: number,
): AdminFormQuestionCreateRequest => ({
  label: '',
  description: '',
  questionOrder: order,
  required: false,
  answerType: 'TEXT',
  selectOptions: null,
  sectionType: 'COMMON',
  departmentType: null,
});

const defaultNoticePayload: AdminFormNoticeCreateRequest = {
  sectionType: 'COMMON',
  departmentType: null,
  title: '',
  content: '',
};

export default function AdminFormDetailPage() {
  const { formId: rawFormId } = useParams<{ formId: string }>();
  const formId = rawFormId ?? '';
  const isNew = formId === 'new';

  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const [formList, setFormList] = useState<AdminFormListItem[]>([]);
  const [detail, setDetail] = useState<AdminFormDetail | null>(null);
  const [questions, setQuestions] = useState<AdminFormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form (new only)
  const [createTitle, setCreateTitle] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Copy questions
  const [copySourceId, setCopySourceId] = useState('');
  const [copying, setCopying] = useState(false);

  // Add question
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [addQuestionPayload, setAddQuestionPayload] = useState(() =>
    defaultQuestionPayload(1),
  );
  const [addingQuestion, setAddingQuestion] = useState(false);

  // Edit question (formQuestionId)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [editQuestionPayload, setEditQuestionPayload] =
    useState<AdminFormQuestionCreateRequest | null>(null);
  const [updatingQuestion, setUpdatingQuestion] = useState(false);

  // Add notice
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [addNoticePayload, setAddNoticePayload] =
    useState(defaultNoticePayload);
  const [addingNotice, setAddingNotice] = useState(false);

  // Edit notice
  const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null);
  const [editNoticePayload, setEditNoticePayload] =
    useState<AdminFormNoticeCreateRequest | null>(null);
  const [updatingNotice, setUpdatingNotice] = useState(false);

  const loadFormList = useCallback(async () => {
    try {
      const data = await adminFormsApi.list();
      setFormList(Array.isArray(data) ? data : []);
    } catch {
      // ignore for list
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (!formId || isNew) return;
    setLoading(true);
    setError(null);
    try {
      const [formData, questionsData] = await Promise.all([
        adminFormsApi.getById(formId),
        adminFormsApi.getQuestions(formId),
      ]);
      setDetail(formData ?? null);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch {
      setError('Form 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [formId, isNew]);

  useEffect(() => {
    void loadFormList();
  }, [loadFormList]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      setError(null);
      setDetail(null);
      setQuestions([]);
      return;
    }
    void loadDetail();
  }, [isNew, loadDetail]);

  const handleCreate = useCallback(async () => {
    const title = createTitle.trim();
    if (!title) {
      toast.error('제목을 입력해 주세요.');
      return;
    }
    setCreating(true);
    try {
      const created = await adminFormsApi.create({ title, open: createOpen });
      const id = created?.formId;
      if (id != null) {
        toast.success('Form을 만들었어요.');
        navigate(`/admin/forms/${id}`, { replace: true });
      }
    } catch {
      toast.error('생성에 실패했어요.');
    } finally {
      setCreating(false);
    }
  }, [createTitle, createOpen, navigate, toast]);

  const handleOpenClose = useCallback(
    async (open: boolean) => {
      if (!formId || isNew) return;
      try {
        if (open) await adminFormsApi.open(formId);
        else await adminFormsApi.close(formId);
        toast.success(open ? 'Form을 OPEN 했어요.' : 'Form을 CLOSE 했어요.');
        void loadDetail();
        void loadFormList();
      } catch {
        toast.error('상태 변경에 실패했어요.');
      }
    },
    [formId, isNew, loadDetail, loadFormList, toast],
  );

  const handleDeleteForm = useCallback(async () => {
    if (!formId || isNew) return;

    const ok = await confirm.open({
      title: '폼 삭제',
      description:
        '이 폼을 삭제할까요?\n활성 폼이거나 지원서가 존재하면 삭제되지 않을 수 있어요.',
      danger: true,
      confirmText: '삭제',
    });
    if (!ok) return;

    try {
      await adminFormsApi.deleteForm(formId);
      toast.success('폼을 삭제했어요.');
      navigate('/admin/forms', { replace: true });
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
    }
  }, [confirm, formId, isNew, navigate, toast]);

  const handleCopyQuestions = useCallback(async () => {
    const sourceId = copySourceId.trim();
    if (!sourceId || !formId || isNew) {
      toast.error('복사할 Form을 선택해 주세요.');
      return;
    }
    const sourceNum = Number(sourceId);
    if (Number.isNaN(sourceNum) || sourceNum <= 0) {
      toast.error('올바른 Form ID를 선택해 주세요.');
      return;
    }
    if (String(sourceNum) === formId) {
      toast.error('같은 Form으로는 복사할 수 없어요.');
      return;
    }
    const ok = await confirm.open({
      title: '문항 복사',
      description: `선택한 Form의 문항으로 덮어쓸까요? 현재 문항은 모두 삭제된 뒤 복사돼요.`,
      danger: true,
      confirmText: '복사',
    });
    if (!ok) return;
    setCopying(true);
    try {
      await adminFormsApi.copyQuestions(formId, { sourceFormId: sourceNum });
      toast.success('문항을 복사했어요.');
      void loadDetail();
    } catch {
      toast.error('복사에 실패했어요.');
    } finally {
      setCopying(false);
    }
  }, [confirm, copySourceId, formId, isNew, loadDetail, toast]);

  const handleAddQuestion = useCallback(async () => {
    if (!formId || isNew) return;
    const label = addQuestionPayload.label.trim();
    if (!label) {
      toast.error('문항 라벨을 입력해 주세요.');
      return;
    }
    const payload = {
      ...addQuestionPayload,
      departmentType:
        addQuestionPayload.sectionType === 'COMMON'
          ? null
          : addQuestionPayload.departmentType,
      selectOptions:
        addQuestionPayload.answerType === 'SELECT'
          ? addQuestionPayload.selectOptions
          : null,
    };
    setAddingQuestion(true);
    try {
      await adminFormsApi.addQuestion(formId, payload);
      toast.success('문항을 추가했어요.');
      setShowAddQuestion(false);
      setAddQuestionPayload(defaultQuestionPayload(questions.length + 1));
      void loadDetail();
    } catch {
      toast.error('추가에 실패했어요.');
    } finally {
      setAddingQuestion(false);
    }
  }, [formId, isNew, addQuestionPayload, questions.length, loadDetail, toast]);

  const handleUpdateQuestion = useCallback(
    async (formQuestionId: number) => {
      if (!formId || isNew || !editQuestionPayload) return;
      const payload = {
        ...editQuestionPayload,
        departmentType:
          editQuestionPayload.sectionType === 'COMMON'
            ? null
            : editQuestionPayload.departmentType,
        selectOptions:
          editQuestionPayload.answerType === 'SELECT'
            ? editQuestionPayload.selectOptions
            : null,
      };
      setUpdatingQuestion(true);
      try {
        await adminFormsApi.updateQuestion(
          formId,
          String(formQuestionId),
          payload,
        );
        toast.success('문항을 수정했어요.');
        setEditingQuestionId(null);
        setEditQuestionPayload(null);
        void loadDetail();
      } catch {
        toast.error('수정에 실패했어요.');
      } finally {
        setUpdatingQuestion(false);
      }
    },
    [formId, isNew, editQuestionPayload, loadDetail, toast],
  );

  const handleDeleteQuestion = useCallback(
    async (formQuestionId: number) => {
      if (!formId || isNew) return;
      const ok = await confirm.open({
        title: '문항 삭제',
        description: '이 문항을 삭제할까요?',
        danger: true,
        confirmText: '삭제',
      });
      if (!ok) return;
      try {
        await adminFormsApi.deleteQuestion(formId, String(formQuestionId));
        toast.success('삭제했어요.');
        void loadDetail();
      } catch {
        toast.error('삭제에 실패했어요.');
      }
    },
    [confirm, formId, isNew, loadDetail, toast],
  );

  const handleAddNotice = useCallback(async () => {
    if (!formId || isNew) return;
    const title = addNoticePayload.title.trim();
    if (!title) {
      toast.error('안내문 제목을 입력해 주세요.');
      return;
    }
    const payload = {
      ...addNoticePayload,
      departmentType:
        addNoticePayload.sectionType === 'COMMON'
          ? null
          : addNoticePayload.departmentType,
    };
    setAddingNotice(true);
    try {
      await adminFormsApi.addNotice(formId, payload);
      toast.success('안내문을 추가했어요.');
      setShowAddNotice(false);
      setAddNoticePayload(defaultNoticePayload);
      void loadDetail();
    } catch {
      toast.error('추가에 실패했어요.');
    } finally {
      setAddingNotice(false);
    }
  }, [formId, isNew, addNoticePayload, loadDetail, toast]);

  const handleUpdateNotice = useCallback(
    async (noticeId: number) => {
      if (!formId || isNew || !editNoticePayload) return;
      const payload = {
        ...editNoticePayload,
        departmentType:
          editNoticePayload.sectionType === 'COMMON'
            ? null
            : editNoticePayload.departmentType,
      };
      setUpdatingNotice(true);
      try {
        await adminFormsApi.updateNotice(formId, String(noticeId), payload);
        toast.success('안내문을 수정했어요.');
        setEditingNoticeId(null);
        setEditNoticePayload(null);
        void loadDetail();
      } catch {
        toast.error('수정에 실패했어요.');
      } finally {
        setUpdatingNotice(false);
      }
    },
    [formId, isNew, editNoticePayload, loadDetail, toast],
  );

  const handleDeleteNotice = useCallback(
    async (noticeId: number) => {
      if (!formId || isNew) return;
      const ok = await confirm.open({
        title: '안내문 삭제',
        description: '이 안내문을 삭제할까요?',
        danger: true,
        confirmText: '삭제',
      });
      if (!ok) return;
      try {
        await adminFormsApi.deleteNotice(formId, String(noticeId));
        toast.success('삭제했어요.');
        void loadDetail();
      } catch {
        toast.error('삭제에 실패했어요.');
      }
    },
    [confirm, formId, isNew, loadDetail, toast],
  );

  // ----- New Form create UI -----
  if (isNew) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Reveal>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/forms"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              ← 목록
            </Link>
            <h1 className="font-heading text-3xl text-primary">
              새 Form 만들기
            </h1>
          </div>
        </Reveal>
        <Reveal
          delayMs={120}
          className="mx-auto mt-6 max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                제목
              </label>
              <input
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="예: 2026-1학기 모집"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-open"
                checked={createOpen}
                onChange={(e) => setCreateOpen(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="create-open"
                className="text-sm font-semibold text-slate-700"
              >
                생성 후 OPEN 상태로 두기 (기존 OPEN Form은 자동 close)
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/admin/forms')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={creating}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-60"
              >
                {creating ? '만드는 중...' : '만들기'}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  // ----- Loading / Error -----
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-center text-sm text-slate-500">불러오는 중...</p>
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/forms"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← 목록
          </Link>
        </div>
        <p className="mt-4 text-sm font-semibold text-rose-600">
          {error ?? 'Form을 찾을 수 없어요.'}
        </p>
      </div>
    );
  }

  const notices = detail.notices ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/forms"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              ← 목록
            </Link>
            <h1 className="font-heading text-2xl text-primary md:text-3xl">
              {detail.title}
            </h1>
            <span
              className={[
                'rounded-full px-2 py-1 text-xs font-semibold',
                detail.open
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500',
              ].join(' ')}
            >
              {detail.open ? 'OPEN' : 'CLOSE'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.open ? (
              <button
                type="button"
                onClick={() => void handleOpenClose(false)}
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100"
              >
                Form CLOSE
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleOpenClose(true)}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-95"
              >
                Form OPEN
              </button>
            )}

            <Link
              to={`/admin/applications?formId=${detail.formId}`}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              지원서 보기
            </Link>

            <button
              type="button"
              onClick={() => void handleDeleteForm()}
              className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50"
            >
              폼 삭제
            </button>
          </div>
        </div>
      </Reveal>

      {/* Copy questions */}
      <Reveal delayMs={80} className="mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">
            문항 복사 (덮어쓰기)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            다른 Form의 문항을 이 Form으로 가져옵니다. 현재 문항은 삭제된 뒤
            복사돼요.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={copySourceId}
              onChange={(e) => setCopySourceId(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <option value="">Form 선택</option>
              {formList
                .filter((f) => String(f.formId) !== formId)
                .map((f) => (
                  <option key={f.formId} value={f.formId}>
                    {f.title} (ID: {f.formId})
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => void handleCopyQuestions()}
              disabled={copying || !copySourceId}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {copying ? '복사 중...' : '복사'}
            </button>
          </div>
        </div>
      </Reveal>

      {/* Questions */}
      <Reveal delayMs={120} className="mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-800">문항</h2>
            <button
              type="button"
              onClick={() => {
                setShowAddQuestion((v) => !v);
                if (!showAddQuestion)
                  setAddQuestionPayload(
                    defaultQuestionPayload(questions.length + 1),
                  );
              }}
              className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/20"
            >
              {showAddQuestion ? '취소' : '문항 추가'}
            </button>
          </div>

          {showAddQuestion && (
            <QuestionForm
              payload={addQuestionPayload}
              setPayload={setAddQuestionPayload}
              onSubmit={() => void handleAddQuestion()}
              submitting={addingQuestion}
              submitLabel="추가"
            />
          )}

          <div className="mt-4 space-y-3">
            {questions.length === 0 && !showAddQuestion && (
              <p className="py-4 text-center text-sm text-slate-500">
                문항이 없어요. 문항 추가로 넣어 주세요.
              </p>
            )}
            {questions.map((q) => (
              <div
                key={q.formQuestionId}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
              >
                {editingQuestionId === q.formQuestionId &&
                editQuestionPayload ? (
                  <QuestionForm
                    payload={editQuestionPayload}
                    setPayload={setEditQuestionPayload}
                    onSubmit={() => void handleUpdateQuestion(q.formQuestionId)}
                    onCancel={() => {
                      setEditingQuestionId(null);
                      setEditQuestionPayload(null);
                    }}
                    submitting={updatingQuestion}
                    submitLabel="저장"
                  />
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-slate-500">
                          #{q.questionOrder}
                        </span>
                        <p className="font-semibold text-slate-900">
                          {q.label}
                        </p>
                        {q.description && (
                          <p className="mt-1 text-sm text-slate-600">
                            {q.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          {q.answerType} · {q.required ? '필수' : '선택'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestionId(q.formQuestionId);
                            setEditQuestionPayload({
                              label: q.label,
                              description: q.description,
                              questionOrder: q.questionOrder,
                              required: q.required,
                              answerType: q.answerType,
                              selectOptions: q.selectOptions || null,
                              sectionType: q.sectionType,
                              departmentType: q.departmentType,
                            });
                          }}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void handleDeleteQuestion(q.formQuestionId)
                          }
                          className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Notices */}
      <Reveal delayMs={160} className="mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-800">안내문</h2>
            <button
              type="button"
              onClick={() => {
                setShowAddNotice((v) => !v);
                if (!showAddNotice) setAddNoticePayload(defaultNoticePayload);
              }}
              className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/20"
            >
              {showAddNotice ? '취소' : '안내문 추가'}
            </button>
          </div>

          {showAddNotice && (
            <NoticeForm
              payload={addNoticePayload}
              setPayload={setAddNoticePayload}
              onSubmit={() => void handleAddNotice()}
              submitting={addingNotice}
              submitLabel="추가"
            />
          )}

          <div className="mt-4 space-y-3">
            {notices.length === 0 && !showAddNotice && (
              <p className="py-4 text-center text-sm text-slate-500">
                안내문이 없어요.
              </p>
            )}
            {notices.map((n) => (
              <NoticeRow
                key={n.noticeId}
                notice={n}
                editing={editingNoticeId === n.noticeId}
                editPayload={editNoticePayload}
                setEditPayload={setEditNoticePayload}
                onStartEdit={() => {
                  setEditingNoticeId(n.noticeId);
                  setEditNoticePayload({
                    sectionType: n.sectionType,
                    departmentType: n.departmentType ?? null,
                    title: n.title,
                    content: n.content,
                  });
                }}
                onSave={() => void handleUpdateNotice(n.noticeId)}
                onCancel={() => {
                  setEditingNoticeId(null);
                  setEditNoticePayload(null);
                }}
                onDelete={() => void handleDeleteNotice(n.noticeId)}
                updating={updatingNotice}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function QuestionForm({
  payload,
  setPayload,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
}: {
  payload: AdminFormQuestionCreateRequest;
  setPayload: (p: AdminFormQuestionCreateRequest) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-600">
            라벨
          </label>
          <input
            value={payload.label}
            onChange={(e) => setPayload({ ...payload, label: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600">
            순서
          </label>
          <input
            type="number"
            min={1}
            value={payload.questionOrder}
            onChange={(e) =>
              setPayload({
                ...payload,
                questionOrder: Number(e.target.value) || 1,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600">
          설명
        </label>
        <input
          value={payload.description}
          onChange={(e) =>
            setPayload({ ...payload, description: e.target.value })
          }
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={payload.required}
            onChange={(e) =>
              setPayload({ ...payload, required: e.target.checked })
            }
            className="h-4 w-4 rounded border-slate-300 text-primary"
          />
          <span className="text-sm font-semibold text-slate-700">필수</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            답변 타입
          </span>
          <select
            value={payload.answerType}
            onChange={(e) =>
              setPayload({
                ...payload,
                answerType: e.target.value,
                selectOptions:
                  e.target.value === 'SELECT' ? payload.selectOptions : null,
              })
            }
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
          >
            {ANSWER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        {payload.answerType === 'SELECT' && (
          <div className="flex-1">
            <input
              value={payload.selectOptions ?? ''}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  selectOptions: e.target.value || null,
                })
              }
              placeholder="선택 옵션 (쉼표 등)"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-600">섹션</span>
        <select
          value={payload.sectionType}
          onChange={(e) =>
            setPayload({
              ...payload,
              sectionType: e.target.value,
              departmentType:
                e.target.value === 'COMMON' ? null : payload.departmentType,
            })
          }
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
        >
          {SECTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {payload.sectionType !== 'COMMON' && (
          <select
            value={payload.departmentType ?? ''}
            onChange={(e) =>
              setPayload({
                ...payload,
                departmentType: e.target.value || null,
              })
            }
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
          >
            <option value="">부서 선택</option>
            {DEPARTMENT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60"
        >
          {submitting ? '처리 중...' : submitLabel}
        </button>
      </div>
    </div>
  );
}

function NoticeForm({
  payload,
  setPayload,
  onSubmit,
  submitting,
  submitLabel,
}: {
  payload: AdminFormNoticeCreateRequest;
  setPayload: (p: AdminFormNoticeCreateRequest) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">섹션</span>
          <select
            value={payload.sectionType}
            onChange={(e) =>
              setPayload({
                ...payload,
                sectionType: e.target.value,
                departmentType:
                  e.target.value === 'COMMON' ? null : payload.departmentType,
              })
            }
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
          >
            {SECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        {payload.sectionType !== 'COMMON' && (
          <select
            value={payload.departmentType ?? ''}
            onChange={(e) =>
              setPayload({
                ...payload,
                departmentType: e.target.value || null,
              })
            }
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
          >
            <option value="">부서</option>
            {DEPARTMENT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600">
          제목
        </label>
        <input
          value={payload.title}
          onChange={(e) => setPayload({ ...payload, title: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600">
          내용
        </label>
        <textarea
          value={payload.content}
          onChange={(e) => setPayload({ ...payload, content: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60"
      >
        {submitting ? '처리 중...' : submitLabel}
      </button>
    </div>
  );
}

function NoticeRow({
  notice,
  editing,
  editPayload,
  setEditPayload,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  updating,
}: {
  notice: AdminFormNoticeItem;
  editing: boolean;
  editPayload: AdminFormNoticeCreateRequest | null;
  setEditPayload: (p: AdminFormNoticeCreateRequest | null) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  updating: boolean;
}) {
  if (editing && editPayload) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <NoticeForm
          payload={editPayload}
          setPayload={(p) => setEditPayload(p)}
          onSubmit={onSave}
          submitting={updating}
          submitLabel="저장"
        />
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
        >
          취소
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div>
        <p className="font-semibold text-slate-900">{notice.title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {notice.sectionType}
          {notice.departmentType
            ? ` · ${getDepartmentLabel(notice.departmentType)}`
            : ''}
        </p>
        <p className="mt-2 text-sm text-slate-600">{notice.content}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onStartEdit}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
        >
          수정
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
