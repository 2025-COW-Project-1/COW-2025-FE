import { useState } from 'react';
import Reveal from '../../components/Reveal';
import { applicationsApi } from '../../api/applications';

function resultLabel(status?: string | null) {
  if (!status) return '결과 없음';
  const s = status.toUpperCase();
  if (s.includes('PASS')) return '합격';
  if (s.includes('FAIL')) return '불합격';
  if (s.includes('NOT_PUBLISHED')) return '결과 미발표';
  return status;
}

export default function ApplicationResultPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setResult(null);
    setMessage(null);

    if (!studentId.trim() || !password.trim()) {
      setMessage('학번과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await applicationsApi.getResult({
        studentId: studentId.trim(),
        password: password.trim(),
      });
      setResult(resultLabel(res?.resultStatus));
      if (res?.message) setMessage(res.message);
    } catch {
      setMessage('결과를 찾을 수 없어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-3xl text-primary">지원 결과 조회</h1>
        <p className="mt-2 text-sm text-slate-600">
          학번과 비밀번호로 결과를 확인하세요.
        </p>
      </Reveal>

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
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCheck}
            disabled={loading}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? '조회 중...' : '결과 조회'}
          </button>
        </div>
      </Reveal>

      {(result || message) && (
        <Reveal
          delayMs={180}
          className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-lg font-bold text-slate-900">
            {result ?? '결과 없음'}
          </p>
          {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        </Reveal>
      )}
    </div>
  );
}
