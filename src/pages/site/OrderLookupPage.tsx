import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi, type OrderDetailResponse } from '../../api/orders';
import OrderDetailCard from '../../components/order/OrderDetailCard';
import Reveal from '../../components/Reveal';
import { useToast } from '../../components/toast/useToast';

const INPUT_CLASS =
  'mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10';

export default function OrderLookupPage() {
  const toast = useToast();
  const [lookupId, setLookupId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);

  const handleSubmit = async () => {
    if (!lookupId.trim() || !password.trim()) {
      toast.error('조회 아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await ordersApi.lookupOrder({
        lookupId: lookupId.trim(),
        password,
      });
      setOrder(result);
    } catch (error) {
      setOrder(null);
      toast.error(
        error instanceof Error ? error.message : '주문 조회에 실패했어요.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-heading text-3xl text-primary hover:opacity-90"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            비회원 주문 조회
          </Link>
          <p className="mt-2 text-sm text-slate-600">
            주문 시 설정한 조회 아이디와 비밀번호로 주문 상태를 확인하세요.
          </p>
        </div>
      </Reveal>

      <Reveal delayMs={100} className="mx-auto mt-6 max-w-4xl">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              조회 아이디
              <input
                value={lookupId}
                onChange={(event) => setLookupId(event.target.value)}
                className={INPUT_CLASS}
                placeholder="예) guest-mju-001"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={INPUT_CLASS}
                placeholder="비밀번호 입력"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '조회 중...' : '주문 조회'}
            </button>
            <Link
              to="/order"
              state={{ source: 'cart' }}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              주문하러 가기
            </Link>
          </div>
        </section>
      </Reveal>

      {order && (
        <Reveal className="mt-6">
          <OrderDetailCard order={order} />
        </Reveal>
      )}
    </div>
  );
}
