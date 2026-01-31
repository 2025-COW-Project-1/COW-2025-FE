import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { loginWithKakao, loginWithNaver } from '../../api/oauth';

type Provider = 'kakao' | 'naver';

type Props = {
  provider: Provider;
};

type SocialAuthMessage =
  | { type: 'SOCIAL_AUTH_SUCCESS'; accessToken: string }
  | { type: 'SOCIAL_AUTH_ERROR'; message?: string };

const TOKEN_KEY = 'accessToken';

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
    const run = async () => {
      if (!code) {
        setError('인가 코드(code)가 없어요.');
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

        // ✅ 팝업으로 열린 콜백이면: 부모창(LoginPage)으로 토큰 전달 → 팝업 닫기
        if (window.opener && !window.opener.closed) {
          const msg: SocialAuthMessage = {
            type: 'SOCIAL_AUTH_SUCCESS',
            accessToken: res.accessToken,
          };

          // 우선 동작 안정성 위해 '*' 사용 (배포 시 프론트 도메인으로 좁히는 걸 추천)
          window.opener.postMessage(msg, '*');
          window.close();
          return;
        }

        // ✅ 팝업이 아니라 현재 탭에서 열린 콜백이면: 직접 저장 후 이동
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        navigate('/', { replace: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '로그인 처리 실패';
        setError(msg);

        // 팝업인 경우 에러도 부모창에 알려주고 닫기(선택)
        if (window.opener && !window.opener.closed) {
          const errMsg: SocialAuthMessage = {
            type: 'SOCIAL_AUTH_ERROR',
            message: msg,
          };
          window.opener.postMessage(errMsg, '*');
          window.close();
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