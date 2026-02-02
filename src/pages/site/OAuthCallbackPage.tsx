import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { loginWithKakao, loginWithNaver } from '../../api/oauth';
import { setAccessToken, setUserName } from '../../utils/auth';

type Provider = 'kakao' | 'naver';

type Props = {
  provider: Provider;
};

type SocialAuthMessage =
  | { type: 'SOCIAL_AUTH_SUCCESS'; accessToken: string; userName?: string }
  | { type: 'SOCIAL_AUTH_ERROR'; message?: string };

function pickUserName(res: unknown): string {
  if (!res || typeof res !== 'object') return 'USER님';
  const r = res as Record<string, unknown>;

  const loginId = typeof r.loginId === 'string' ? r.loginId.trim() : '';
  if (loginId) return loginId;

  const email = typeof r.email === 'string' ? r.email.trim() : '';
  if (email) return email.includes('@') ? email.split('@')[0] : email;

  const userName = typeof r.userName === 'string' ? r.userName.trim() : '';
  if (userName) return userName;

  return 'USER';
}

export default function OAuthCallbackPage({ provider }: Props) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const code = params.get('code') ?? '';
  const state = params.get('state') ?? '';

  const title = useMemo(() => {
    return provider === 'kakao'
      ? '카카오 로그인 처리 중...'
      : '네이버 로그인 처리 중...';
  }, [provider]);

  useEffect(() => {
    const post = (payload: SocialAuthMessage) => {
      try {
        window.opener?.postMessage(payload, '*');
      } catch {
        // ignore
      }
    };

    const close = () => {
      try {
        window.close();
      } catch {
        // ignore
      }
    };

    const run = async () => {
      if (!code) {
        const msg = '인가 코드(code)가 없어요.';
        setError(msg);
        post({ type: 'SOCIAL_AUTH_ERROR', message: msg });
        return;
      }

      try {
        const res =
          provider === 'kakao'
            ? await loginWithKakao(code)
            : await (async () => {
                if (!state) throw new Error('state가 없어요.');
                return loginWithNaver(code, state);
              })();

        const name = pickUserName(res);

        if (window.opener && !window.opener.closed) {
          post({
            type: 'SOCIAL_AUTH_SUCCESS',
            accessToken: res.accessToken,
            userName: name,
          });
          close();
          return;
        }

        setAccessToken(res.accessToken);
        setUserName(name);

        navigate('/', { replace: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '로그인 처리 실패';
        setError(msg);

        if (window.opener && !window.opener.closed) {
          post({ type: 'SOCIAL_AUTH_ERROR', message: msg });
          close();
        }
      }
    };

    run();
  }, [provider, code, state, navigate]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-2xl text-primary">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">잠시만 기다려 주세요.</p>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-white p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}
      </Reveal>
    </div>
  );
}
