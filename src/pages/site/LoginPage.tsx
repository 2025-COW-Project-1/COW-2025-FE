import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { adminApi } from '../../api/admin';

type Mode = 'user' | 'admin';
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? 'access_token';
const LOGIN_ID_KEY = 'admin_login_id';

const KAKAO_AUTHORIZE_URL = import.meta.env.VITE_KAKAO_AUTHORIZE_URL as
  | string
  | undefined;
const NAVER_AUTHORIZE_URL = import.meta.env.VITE_NAVER_AUTHORIZE_URL as
  | string
  | undefined;

// 팝업 로그인 성공 메시지 타입(부모창에서 수신)
type SocialAuthMessage =
  | { type: 'SOCIAL_AUTH_SUCCESS'; accessToken: string }
  | { type: 'SOCIAL_AUTH_ERROR'; message?: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ 기본은 항상 user, 단 ?mode=admin이면 admin
  const initialMode: Mode = useMemo(() => {
    const q = searchParams.get('mode');
    if (q === 'admin') return 'admin';
    return 'user';
  }, [searchParams]);

  const [mode, setMode] = useState<Mode>(initialMode);

  // 관리자 로그인 폼 state
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // 공통 상태
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSubmitting = status === 'submitting';

  // 팝업 핸들 저장(팝업 닫기/폴링)
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const clearMessageIfNeeded = () => {
    if (status === 'error' || status === 'success') {
      setStatus('idle');
      setErrorMsg(null);
    }
  };

  const onSelectMode = (next: Mode) => {
    setMode(next);
    clearMessageIfNeeded();

    // URL에 mode 유지(원하면 유지, 싫으면 이 부분 삭제해도 됨)
    const params = new URLSearchParams(searchParams);
    params.set('mode', next);
    navigate(
      { pathname: '/login', search: params.toString() },
      { replace: true },
    );
  };

  /**
   * ✅ 소셜 로그인 팝업 열기
   * - 새창에서 authorize URL 이동
   * - 성공 시 /login/success 페이지에서 postMessage로 부모창에 토큰 전달
   */
  const startSocialLogin = (provider: 'kakao' | 'naver') => {
    clearMessageIfNeeded();

    const url =
      provider === 'kakao' ? KAKAO_AUTHORIZE_URL : NAVER_AUTHORIZE_URL;
    if (!url) {
      setStatus('error');
      setErrorMsg('소셜 로그인 URL이 설정되지 않았어요. (.env 확인)');
      return;
    }

    // ✅ provider를 callback에서 알 수 있게 query로 추가
    const popupUrl = `${url}${
      url.includes('?') ? '&' : '?'
    }provider=${provider}`;

    const width = 520;
    const height = 720;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      popupUrl, // ✅ url 말고 popupUrl
      'social-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      setStatus('error');
      setErrorMsg(
        '팝업이 차단됐어요. 브라우저에서 팝업 허용 후 다시 시도해 주세요.',
      );
      return;
    }

    popupRef.current = popup;
    popup.focus();
  };

  /**
   * ✅ 팝업에서 postMessage로 "로그인 성공"을 보내면 여기서 받음
   * - 토큰 저장
   * - 팝업 닫기
   * - 메인으로 이동
   */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // 보안: 같은 origin만 허용(개발 중이면 localhost / 배포면 도메인에 맞게)
      // 서버가 아직 닫혀있는 상태라 정확히 못 박기 어렵다면 일단 느슨하게 두고,
      // 서버 켜지면 origin 체크를 강화하는 걸 추천.
      // if (event.origin !== window.location.origin) return;

      const data = event.data as SocialAuthMessage;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'SOCIAL_AUTH_SUCCESS') {
        localStorage.setItem(TOKEN_KEY, data.accessToken);

        // 팝업 닫기
        try {
          popupRef.current?.close();
        } catch {
          // ignore
        } finally {
          popupRef.current = null;
        }

        // 메인으로 이동
        navigate('/', { replace: true });
      }

      if (data.type === 'SOCIAL_AUTH_ERROR') {
        try {
          popupRef.current?.close();
        } catch {
          // ignore
        } finally {
          popupRef.current = null;
        }

        setStatus('error');
        setErrorMsg(
          data.message || '소셜 로그인에 실패했어요. 다시 시도해 주세요.',
        );
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  const validateAdmin = () => {
    if (!userId.trim()) return '아이디를 입력해 주세요.';
    if (!password.trim()) return '비밀번호를 입력해 주세요.';
    return null;
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const v = validateAdmin();
    if (v) {
      setStatus('error');
      setErrorMsg(v);
      return;
    }

    setStatus('submitting');
    setErrorMsg(null);

    try {
      const result = await adminApi.login({
        userId: userId.trim(),
        password: password.trim(),
      });

      if (!result?.accessToken) {
        setStatus('error');
        setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      localStorage.setItem(TOKEN_KEY, result.accessToken);
      if (result?.loginId) localStorage.setItem(LOGIN_ID_KEY, result.loginId);

      setStatus('success');
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus('error');
      setErrorMsg(msg);
    } finally {
      setStatus((prev) => (prev === 'submitting' ? 'idle' : prev));
    }
  };

  // 스타일(기존 톤 유지)
  const shell = 'mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12';
  const panel =
    'mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 sm:mt-10';
  const tabBar = 'grid grid-cols-2 border-b border-slate-100 bg-white';
  const tabBtnBase =
    'relative py-5 text-center text-base font-semibold transition sm:text-lg';
  const tabActive = 'text-slate-900';
  const tabInactive = 'text-slate-400 hover:text-slate-600';

  const body = 'p-6 sm:p-10';

  const input =
    'mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition ' +
    'focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-50';

  const primaryBtn =
    'inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-sm ' +
    'transition hover:opacity-95 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-primary/20 ' +
    'disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto';

  const socialBtnBase =
    'group flex h-14 w-full items-center justify-center rounded-2xl text-base font-semibold transition ' +
    'hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.99] disabled:opacity-60';

  const showIndicatorLeft = mode === 'user';

  return (
    <div className={shell}>
      <Reveal>
        <h1 className="font-heading text-2xl text-primary sm:text-3xl">
          LOGIN
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          일반 로그인(소셜) 또는 관리자 로그인을 선택해 주세요.
        </p>
      </Reveal>

      <Reveal className={panel} delayMs={120}>
        <div className="relative">
          <div
            className={[
              'pointer-events-none absolute bottom-0 h-0.5 w-1/2 bg-primary transition-transform duration-300',
              showIndicatorLeft ? 'translate-x-0' : 'translate-x-full',
            ].join(' ')}
          />
          <div className={tabBar}>
            <button
              type="button"
              className={[
                tabBtnBase,
                mode === 'user' ? tabActive : tabInactive,
              ].join(' ')}
              onClick={() => onSelectMode('user')}
              disabled={isSubmitting}
            >
              일반 로그인
            </button>
            <button
              type="button"
              className={[
                tabBtnBase,
                mode === 'admin' ? tabActive : tabInactive,
              ].join(' ')}
              onClick={() => onSelectMode('admin')}
              disabled={isSubmitting}
            >
              관리자 로그인
            </button>
          </div>
        </div>

        <div className={body}>
          {mode === 'user' ? (
            <Reveal>
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-lg text-slate-900 sm:text-xl">
                    간편 로그인
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    카카오/네이버로 빠르게 시작할 수 있어요.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => startSocialLogin('kakao')}
                    disabled={isSubmitting}
                    className={`${socialBtnBase} bg-[#FEE500] text-[#191600]`}
                  >
                    카카오로 시작하기
                  </button>

                  <button
                    type="button"
                    onClick={() => startSocialLogin('naver')}
                    disabled={isSubmitting}
                    className={`${socialBtnBase} bg-[#03C75A] text-white`}
                  >
                    네이버로 시작하기
                  </button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-relaxed text-slate-500 sm:max-w-[70%]">
                    로그인 진행 시 서비스 이용약관 및 개인정보 처리방침에 동의한
                    것으로 간주됩니다.
                  </p>
                  <div className="flex items-center gap-4">
                    <Link
                      to="/"
                      className="text-xs font-semibold text-slate-700 hover:underline"
                    >
                      메인으로
                    </Link>
                    <Link
                      to="/contact"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      문의하기
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-lg text-slate-900 sm:text-xl">
                    관리자 로그인
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    관리자 계정으로 로그인하면 관리 페이지에 접근할 수 있어요.
                  </p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-900">
                      아이디
                    </label>
                    <input
                      value={userId}
                      onChange={(e) => {
                        setUserId(e.target.value);
                        clearMessageIfNeeded();
                      }}
                      autoComplete="username"
                      className={input}
                      placeholder="아이디를 입력해주세요."
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-900">
                      비밀번호
                    </label>
                    <input
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearMessageIfNeeded();
                      }}
                      type="password"
                      autoComplete="current-password"
                      className={input}
                      placeholder="비밀번호를 입력해주세요."
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500 sm:max-w-[70%]">
                      보안상 공용 기기에서는 로그아웃을 꼭 해주세요.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={primaryBtn}
                    >
                      {isSubmitting ? '로그인 중...' : '로그인'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to="/"
                      className="text-xs font-semibold text-slate-700 hover:underline"
                    >
                      메인으로
                    </Link>
                    <Link
                      to="/contact"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      문의하기
                    </Link>
                  </div>
                </form>
              </div>
            </Reveal>
          )}

          <div className="mt-6 min-h-5.5">
            {status === 'error' && errorMsg && (
              <p className="text-sm text-rose-600">{errorMsg}</p>
            )}
            {status === 'success' && (
              <p className="text-sm text-emerald-600">로그인에 성공했어요.</p>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
