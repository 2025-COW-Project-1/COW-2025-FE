import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { loginWithKakao, loginWithNaver } from '../../api/oauth';

type Provider = 'kakao' | 'naver';

type SocialAuthMessage =
  | { type: 'SOCIAL_AUTH_SUCCESS'; accessToken: string }
  | { type: 'SOCIAL_AUTH_ERROR'; message?: string };

type Props = {
  provider: Provider;
};

export default function OAuthCallbackPage({ provider }: Props) {
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const code = params.get('code') ?? '';
  const state = params.get('state') ?? '';

  const title = useMemo(() => {
    return provider === 'kakao'
      ? '카카오 로그인 처리 중...'
      : '네이버 로그인 처리 중...';
  }, [provider]);

  useEffect(() => {
    const send = (payload: SocialAuthMessage) => {
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
        setError('인가 코드(code)가 없어요.');
        send({
          type: 'SOCIAL_AUTH_ERROR',
          message: '인가 코드(code)가 없어요.',
        });
        return;
      }

      try {
        if (provider === 'kakao') {
          const res = await loginWithKakao(code);
          send({ type: 'SOCIAL_AUTH_SUCCESS', accessToken: res.accessToken });
          close();
          return;
        }

        // naver는 state 필수
        if (!state) {
          setError('state가 없어요.');
          send({ type: 'SOCIAL_AUTH_ERROR', message: 'state가 없어요.' });
          return;
        }

        const res = await loginWithNaver(code, state);
        send({ type: 'SOCIAL_AUTH_SUCCESS', accessToken: res.accessToken });
        close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || '로그인 처리에 실패했어요.');
        send({ type: 'SOCIAL_AUTH_ERROR', message: msg });
      }
    };

    run();
  }, [provider, code, state]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-2xl text-primary">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          잠시만 기다려 주세요. 자동으로 창이 닫힙니다.
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
