import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { loginWithKakao, loginWithNaver } from '../../api/oauth';
import { setAuth } from '../../utils/auth';

type Provider = 'kakao' | 'naver';

type SocialAuthMessage =
  | { type: 'SOCIAL_AUTH_SUCCESS'; accessToken: string; userName: string }
  | { type: 'SOCIAL_AUTH_ERROR'; message: string };

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const providerFromPath = location.pathname.includes('/oauth/kakao/callback')
    ? 'kakao'
    : location.pathname.includes('/oauth/naver/callback')
    ? 'naver'
    : '';

  const provider = (params.get('provider') ?? providerFromPath) as Provider;
  const code = params.get('code') ?? '';
  const state = params.get('state') ?? '';

  const title = useMemo(() => {
    if (provider === 'kakao') return '카카오 로그인 처리 중...';
    if (provider === 'naver') return '네이버 로그인 처리 중...';
    return '로그인 처리 중...';
  }, [provider]);

  useEffect(() => {
    const postToOpener = (payload: SocialAuthMessage) => {
      try {
        window.opener?.postMessage(payload, '*');
      } catch {
        // ignore
      }
    };

    const closePopup = () => {
      try {
        window.close();
      } catch {
        // ignore
      }
    };

    const fail = (msg: string) => {
      setError(msg);
      postToOpener({ type: 'SOCIAL_AUTH_ERROR', message: msg });
    };

    const run = async () => {
      try {
        if (provider !== 'kakao' && provider !== 'naver') {
          fail('provider 파라미터가 올바르지 않아요.');
          return;
        }

        if (!code) {
          fail('인가 코드(code)가 없어요.');
          return;
        }

        if (provider === 'naver' && !state) {
          fail('state가 없어요.');
          return;
        }

        const res =
          provider === 'kakao'
            ? await loginWithKakao(code)
            : await loginWithNaver(code, state);

        const name = (res.userName ?? '').trim() || 'USER';

        // ✅ 팝업에서도 저장
        setAuth({ accessToken: res.accessToken, userName: name });

        // ✅ 부모창에 전달
        postToOpener({
          type: 'SOCIAL_AUTH_SUCCESS',
          accessToken: res.accessToken,
          userName: name,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '로그인 처리 실패';
        fail(msg);
      } finally {
        // ✅ 항상 팝업 닫기 시도
        closePopup();

        // 팝업이 아닌 경우 / 닫기 실패 대비
        setTimeout(() => {
          if (!window.opener || window.opener.closed) {
            navigate('/login', { replace: true });
          }
        }, 500);
      }
    };

    run();
  }, [provider, code, state, navigate]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-2xl text-primary">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          잠시만 기다려 주세요. 자동으로 진행됩니다.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-white p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}
      </Reveal>
    </div>
  );
}
