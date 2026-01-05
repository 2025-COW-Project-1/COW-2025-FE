// src/pages/AdminLoginPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { adminApi } from '../api/admin';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<{
    id: number;
    username: string;
    role: string;
  } | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-3xl text-primary">관리자 로그인</h1>
        <p className="mt-2 text-slate-600">
          로그인 후 <span className="font-bold">내 정보 조회</span>까지 연결
          테스트합니다.
        </p>
      </Reveal>

      <Reveal
        delayMs={80}
        className="mt-8 mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setMe(null);

            try {
              // 1) 로그인 (204)
              await adminApi.login({ username, password });

              // 2) 내 정보 조회 (200 + JSON)
              const data = await adminApi.me();
              setMe(data);
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              setError(msg);
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <label className="block">
            <div className="mb-1 text-sm font-bold text-slate-700">아이디</div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/60"
              placeholder="admin"
              required
              disabled={loading}
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-bold text-slate-700">
              비밀번호
            </div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/60"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className={[
              'w-full rounded-xl px-5 py-3 text-sm font-bold text-white',
              loading ? 'bg-primary/60' : 'bg-primary',
            ].join(' ')}
          >
            {loading ? '확인 중...' : '로그인'}
          </button>

          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-sm font-bold text-slate-700 hover:underline"
            >
              ← 홈으로
            </Link>
            <Link
              to="/contact"
              className="text-sm font-bold text-primary hover:underline"
            >
              문의 →
            </Link>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-white p-4 text-sm font-bold text-rose-700">
              실패: {error}
              <div className="mt-2 text-xs font-semibold text-slate-500">
                * 로그인(204) 후에도 me가 401이면 쿠키가 저장되지 않았을 수
                있어요.
                <br />* 이 경우 vite 프록시의 cookieDomainRewrite 설정을
                확인하세요.
              </div>
            </div>
          )}

          {me && (
            <div className="rounded-2xl bg-primary/10 p-4 text-sm font-bold text-primary">
              내 정보 조회 성공!
              <div className="mt-2 text-xs text-slate-700">
                <pre className="whitespace-pre-wrap break-words font-mono">
                  {JSON.stringify(me, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </form>
      </Reveal>
    </div>
  );
}
