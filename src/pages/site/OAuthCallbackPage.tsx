import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { loginWithKakao, loginWithNaver } from '../../api/oauth';
import { setAuth } from '../../utils/auth';

type Provider = 'kakao' | 'naver';

type SocialAuthMessage =
  | { type: 'SOCIAL_AUTH_SUCCESS'; accessToken: string; userName: string }
  | { type: 'SOCIAL_AUTH_ERROR'; message: string };

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const provider = (params.get('provider') ?? '') as Provider;
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

    const run = async () => {
      // provider
      if (provider !== 'kakao' && provider !== 'naver') {
        const msg = 'provider 파라미터가 올바르지 않아요.';
        setError(msg);
        postToOpener({ type: 'SOCIAL_AUTH_ERROR', message: msg });
        return;
      }

      // code
      if (!code) {
        const msg = '인가 코드(code)가 없어요.';
        setError(msg);
        postToOpener({ type: 'SOCIAL_AUTH_ERROR', message: msg });
        return;
      }

      // naver state
      if (provider === 'naver' && !state) {
        const msg = 'state가 없어요.';
        setError(msg);
        postToOpener({ type: 'SOCIAL_AUTH_ERROR', message: msg });
        return;
      }

      try {
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

        // ✅ 팝업 닫기
        closePopup();

        // 팝업이 아닌 경우 대비
        if (!window.opener || window.opener.closed) {
          navigate('/', { replace: true });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : '로그인 처리 실패';
        setError(msg);
        postToOpener({ type: 'SOCIAL_AUTH_ERROR', message: msg });
        closePopup();
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
