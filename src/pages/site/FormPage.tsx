import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Reveal from '../../components/Reveal';
import { ApiError } from '../../api/client';
import {
  formsApi,
  type ActiveFormResponse,
  type FormQuestion,
} from '../../api/forms';

type MajorOption = {
  label: string;
  value: string;
};

type GradeOption = {
  label: string;
  value: string;
};

const MAJOR_OPTIONS: MajorOption[] = [
  { label: '학과1', value: '학과1' },
  { label: '학과2', value: '학과2' },
  { label: '학과3', value: '학과3' },
];

const GRADE_OPTIONS: GradeOption[] = [
  { label: '1학년', value: 'GRADE_1' },
  { label: '2학년', value: 'GRADE_2' },
  { label: '3학년', value: 'GRADE_3' },
  { label: '4학년', value: 'GRADE_4' },
];

export default function FormPage() {
  const [form, setForm] = useState<ActiveFormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('');
  const [phone, setPhone] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);

    formsApi
      .getActiveForm()
      .then((data) => {
        if (!active) return;
        setForm(data);
        setAnswers({});
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setLoadError('모집 폼을 불러오지 못했습니다.');
        } else {
          setLoadError('모집 폼을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const questions = useMemo<FormQuestion[]>(
    () => (form?.questions ?? []).slice().sort((a, b) => a.orderNo - b.orderNo),
    [form]
  );

  const requiredQuestionIds = useMemo(
    () => questions.filter((q) => q.required).map((q) => q.id),
    [questions]
  );

  const hasMissingRequired = useMemo(() => {
    if (!name.trim()) return true;
    if (!studentNo.trim()) return true;
    if (!major) return true;
    if (!grade) return true;
    if (!phone.trim()) return true;
    return requiredQuestionIds.some((id) => !answers[id]?.trim());
  }, [name, studentNo, major, grade, phone, answers, requiredQuestionIds]);

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (hasMissingRequired) {
      setSubmitError('지원서 제출에 실패했습니다. 다시 시도해 주세요.');
      return;
    }

    const answered = questions
      .map((question) => ({
        questionId: question.id,
        value: answers[question.id]?.trim() ?? '',
      }))
      .filter((entry) => entry.value.length > 0);

    const payload = {
      name: name.trim(),
      studentNo: studentNo.trim(),
      major,
      grade,
      phone: phone.trim(),
      answers: answered,
    };

    try {
      setSubmitting(true);
      await formsApi.applyActiveForm(payload);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setSubmitError('모집 폼을 불러오지 못했습니다.');
          return;
        }
        if (err.status === 409) {
          setSubmitError('현재 모집 중이 아닙니다.');
          return;
        }
      }
      setSubmitError('지원서 제출에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-3xl text-primary">지원하기</h1>
        <p className="mt-2 text-slate-600">
          명지공방 활동에 참여하고 싶은 지원자를 기다리고 있어요.
        </p>
      </Reveal>

      <Reveal delayMs={80} className="mt-8 rounded-3xl bg-white p-8">
        <h2 className="font-heading text-xl text-slate-900">모집 지원서</h2>
        {loading && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            모집 폼을 불러오는 중입니다.
          </div>
        )}
        {!loading && loadError && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            {loadError}
          </div>
        )}
        {!loading && !loadError && form && (
          <>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-bold text-slate-900">{form.title}</div>
              {form.description && (
                <p className="mt-2 text-sm text-slate-600">
                  {form.description}
                </p>
              )}
            </div>

            {submitted ? (
              <div className="mt-6 rounded-2xl bg-primary/10 p-6 text-sm font-bold text-primary">
                지원서가 제출되었습니다. 확인 후 연락드릴게요.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-sm font-bold text-slate-700">
                      이름*
                    </div>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/60"
                      placeholder="홍길동"
                      required
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1 text-sm font-bold text-slate-700">
                      학번*
                    </div>
                    <input
                      value={studentNo}
                      onChange={(e) => setStudentNo(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/60"
                      placeholder="202312345"
                      required
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1 text-sm font-bold text-slate-700">
                      학과*
                    </div>
                    <select
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/60"
                      required
                    >
                      <option value="" disabled>
                        학년*
                      </option>
                      {MAJOR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <div className="mb-1 text-sm font-bold text-slate-700">
                      학년*
                    </div>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/60"
                      required
                    >
                      <option value="" disabled>
                        학년*
                      </option>
                      {GRADE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block md:col-span-2">
                    <div className="mb-1 text-sm font-bold text-slate-700">
                      연락처*
                    </div>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/60"
                      placeholder="010-1234-5678"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-bold text-slate-700">
                    지원 질문
                  </div>
                  {questions.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                      등록된 질문이 없습니다.
                    </div>
                  ) : (
                    questions.map((question) => (
                      <label
                        key={question.id}
                        className="block rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <span>
                            {question.orderNo}. {question.label}
                          </span>
                          {question.required && (
                            <span className="text-rose-500">*</span>
                          )}
                        </div>
                        {question.description && (
                          <p className="mt-2 text-xs text-slate-500">
                            {question.description}
                          </p>
                        )}
                        <textarea
                          value={answers[question.id] ?? ''}
                          onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                          }
                          rows={3}
                          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/60"
                          placeholder="답변을 입력해 주세요"
                          required={question.required}
                        />
                      </label>
                    ))
                  )}
                </div>

                {submitError && (
                  <div className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-600">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {submitting ? '제출 중...' : '지원서 제출'}
                </button>
              </form>
            )}
          </>
        )}
      </Reveal>
    </div>
  );
}
