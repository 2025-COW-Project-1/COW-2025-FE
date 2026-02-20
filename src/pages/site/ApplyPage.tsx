import { useCallback, useEffect, useMemo, useState } from 'react';
import Reveal from '../../components/Reveal';
import {
  applicationsApi,
  type ApplicationFormResponse,
  type ApplicationQuestion,
} from '../../api/applications';
import { uploadToPresignedUrl } from '../../api/adminProjects';
import { DEPARTMENT_OPTIONS } from '../../types/recruit';
import type { DepartmentType } from '../../types/recruit';

type AnswerValue = string | string[] | null;

type FileState = {
  key?: string | null;
  uploading?: boolean;
  error?: string | null;
};

function parseOptions(raw?: string | null): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x));
    } catch {
      // fallthrough
    }
  }
  return trimmed
    .split(/\r?\n|,/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeAnswerValue(value: AnswerValue) {
  if (value == null) return null;
  if (Array.isArray(value)) {
    const filtered = value.map((v) => v.trim()).filter(Boolean);
    return filtered.length ? filtered.join(',') : null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function getAnswerType(raw?: string | null) {
  return (raw ?? '').toUpperCase();
}

export default function ApplyPage() {
  const [form, setForm] = useState<ApplicationFormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [firstDepartment, setFirstDepartment] = useState<DepartmentType | ''>('');
  const [secondDepartment, setSecondDepartment] = useState<DepartmentType | ''>('');

  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [files, setFiles] = useState<Record<number, FileState>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await applicationsApi.getForm();
      setForm(res ?? null);
    } catch {
      setError('현재 모집 중인 지원서가 없어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const questions = useMemo(() => {
    return (form?.questions ?? []).slice().sort((a, b) => {
      const ao = a.questionOrder ?? 0;
      const bo = b.questionOrder ?? 0;
      return ao - bo;
    });
  }, [form?.questions]);

  const notices = useMemo(() => form?.notices ?? [], [form?.notices]);

  const handleAnswerChange = (id: number, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = async (q: ApplicationQuestion, file: File) => {
    const qid = q.formQuestionId;
    setFiles((prev) => ({
      ...prev,
      [qid]: { ...prev[qid], uploading: true, error: null },
    }));

    try {
      const res = await applicationsApi.presignFiles([
        {
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
        },
      ]);
      const target = res.items?.[0];
      if (!target) throw new Error('업로드 URL이 없어요.');
      await uploadToPresignedUrl(
        target.uploadUrl,
        file,
        file.type || 'application/octet-stream',
      );

      setFiles((prev) => ({
        ...prev,
        [qid]: { key: target.key, uploading: false, error: null },
      }));
      handleAnswerChange(qid, target.key);
    } catch {
      setFiles((prev) => ({
        ...prev,
        [qid]: {
          ...prev[qid],
          uploading: false,
          error: '파일 업로드에 실패했어요.',
        },
      }));
    }
  };

  const handleSubmit = async () => {
    setValidationError(null);

    if (!studentId.trim() || !password.trim()) {
      setValidationError('학번과 비밀번호를 입력해주세요.');
      return;
    }
    if (!firstDepartment || !secondDepartment) {
      setValidationError('1지망/2지망을 모두 선택해주세요.');
      return;
    }
    if (firstDepartment === secondDepartment) {
      setValidationError('1지망과 2지망은 서로 달라야 해요.');
      return;
    }

    for (const q of questions) {
      const val = normalizeAnswerValue(answers[q.formQuestionId] ?? null);
      if (q.required && !val) {
        setValidationError(
          `필수 질문을 입력해주세요: ${q.content ?? ''}`.trim(),
        );
        return;
      }
      if (getAnswerType(q.answerType).includes('FILE')) {
        const f = files[q.formQuestionId];
        if (q.required && (!f || !f.key)) {
          setValidationError(
            `필수 파일을 업로드해주세요: ${q.content ?? ''}`.trim(),
          );
          return;
        }
      }
    }

    const payloadAnswers = questions
      .map((q) => {
        const value = normalizeAnswerValue(answers[q.formQuestionId] ?? null);
        return value
          ? { formQuestionId: q.formQuestionId, value }
          : q.required
            ? { formQuestionId: q.formQuestionId, value: '' }
            : null;
      })
      .filter(Boolean) as Array<{
      formQuestionId: number;
      value: string | null;
    }>;

    setSubmitLoading(true);
    try {
      await applicationsApi.create({
        studentId: studentId.trim(),
        password: password.trim(),
        firstDepartment,
        secondDepartment,
        answers: payloadAnswers,
      });
      alert('지원서가 제출되었습니다.');
    } catch {
      alert('지원서 제출에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">
        불러오는 중...
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-heading text-2xl text-slate-900">지원서 작성</h1>
        <p className="mt-3 text-sm text-slate-600">
          {error ?? '폼을 불러오지 못했어요.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-3xl text-primary">지원서 작성</h1>
        <p className="mt-2 text-sm text-slate-600">
          모집 폼에 맞춰 지원서를 작성해 주세요.
        </p>
      </Reveal>

      {validationError && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {validationError}
        </div>
      )}

      <Reveal
        delayMs={120}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">학번</label>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700">1지망</label>
            <select
              value={firstDepartment}
              onChange={(e) =>
                setFirstDepartment((e.target.value || '') as DepartmentType | '')
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            >
              <option value="">선택하세요</option>
              {DEPARTMENT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700">2지망</label>
            <select
              value={secondDepartment}
              onChange={(e) =>
                setSecondDepartment((e.target.value || '') as DepartmentType | '')
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            >
              <option value="">선택하세요</option>
              {DEPARTMENT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Reveal>

      {notices.length > 0 && (
        <Reveal
          delayMs={180}
          className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-900">공지사항</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-700">
            {notices.map((n) => (
              <li
                key={String(n.noticeId)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {n.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{n.content}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <Reveal
        delayMs={240}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-bold text-slate-900">질문</h2>

        <div className="mt-4 space-y-5">
          {questions.map((q) => {
            const type = getAnswerType(q.answerType);
            const value = answers[q.formQuestionId] ?? '';
            const options = parseOptions(q.selectOptions);

            return (
              <div key={q.formQuestionId} className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {q.content}
                  {q.required && <span className="ml-1 text-rose-500">*</span>}
                </label>
                {q.description && (
                  <p className="text-xs text-slate-400">{q.description}</p>
                )}

                {type.includes('FILE') ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFileUpload(q, file);
                      }}
                      className="text-sm"
                    />
                    {files[q.formQuestionId]?.uploading && (
                      <span className="text-xs text-slate-500">
                        업로드 중...
                      </span>
                    )}
                    {files[q.formQuestionId]?.key && (
                      <span className="text-xs text-emerald-600">
                        업로드 완료
                      </span>
                    )}
                    {files[q.formQuestionId]?.error && (
                      <span className="text-xs text-rose-600">
                        {files[q.formQuestionId]?.error}
                      </span>
                    )}
                  </div>
                ) : type.includes('TEXTAREA') ? (
                  <textarea
                    value={String(value ?? '')}
                    onChange={(e) =>
                      handleAnswerChange(q.formQuestionId, e.target.value)
                    }
                    className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                  />
                ) : type.includes('SELECT') || type.includes('RADIO') ? (
                  <select
                    value={String(value ?? '')}
                    onChange={(e) =>
                      handleAnswerChange(q.formQuestionId, e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">선택</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : type.includes('CHECK') || type.includes('MULTI') ? (
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const arr = Array.isArray(value) ? value : [];
                      const checked = arr.includes(opt);
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(arr);
                              if (e.target.checked) next.add(opt);
                              else next.delete(opt);
                              handleAnswerChange(
                                q.formQuestionId,
                                Array.from(next),
                              );
                            }}
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    value={String(value ?? '')}
                    onChange={(e) =>
                      handleAnswerChange(q.formQuestionId, e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitLoading}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
          >
            {submitLoading ? '제출 중...' : '지원서 제출'}
          </button>
        </div>
      </Reveal>
    </div>
  );
}
