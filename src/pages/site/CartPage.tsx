import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { useConfirm } from '../../components/confirm/useConfirm';
import { useToast } from '../../components/toast/useToast';
import {
  CART_CHANGED_EVENT,
  clearMergedNotice,
  clearCartItems,
  getCartCount,
  getCartTotal,
  loadCartItems,
  removeCartItem,
  setCartItemQuantity,
  type CartItem,
} from '../../utils/cart';

function formatMoney(value: number) {
  return value.toLocaleString();
}

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(() => loadCartItems());
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    const sync = () => setItems(loadCartItems());
    window.addEventListener(CART_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const totalCount = useMemo(() => getCartCount(items), [items]);
  const totalPrice = useMemo(() => getCartTotal(items), [items]);
  const hasNonOpenItem = useMemo(
    () => items.some((item) => item.status && item.status !== 'OPEN'),
    [items],
  );

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.info('장바구니가 비어 있어요.');
      return;
    }
    if (hasNonOpenItem) {
      toast.error('진행중이 아닌 상품이 있어 주문을 진행할 수 없어요.');
      return;
    }

    const confirmed = await confirm.open({
      title: '주문서를 작성할까요?',
      description: '장바구니 상품으로 주문서를 작성합니다.',
      confirmText: '주문서 작성',
      cancelText: '계속 쇼핑',
    });

    if (!confirmed) return;
    navigate('/order', { state: { source: 'cart' } });
  };

  const handleClear = async () => {
    if (items.length === 0) return;
    const confirmed = await confirm.open({
      title: '장바구니 비우기',
      description: '장바구니의 상품을 모두 삭제할까요?',
      confirmText: '모두 삭제',
      cancelText: '취소',
      danger: true,
    });
    if (!confirmed) return;
    clearCartItems();
    toast.success('장바구니를 비웠어요.');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl text-slate-900">장바구니</h1>
              <p className="mt-2 text-sm text-slate-600">
                총 {totalCount}개 상품, 합계 {formatMoney(totalPrice)}원
              </p>
            </div>

            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <Link
                to="/order"
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"
              >
                주문서
              </Link>
              <Link
                to="/orders/lookup"
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white hover:shadow-sm"
              >
                주문 조회
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {items.length === 0 ? (
        <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-500">장바구니가 비어 있어요.</p>
          <Link
            to="/projects"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white hover:opacity-95"
          >
            상품 보러 가기
          </Link>
        </Reveal>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <Reveal className="space-y-3">
            {items.map((item) => (
              <article
                key={item.itemId}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <Link
                    to={`/projects/${item.projectId}/items/${item.itemId}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[11px] font-semibold text-slate-400">
                        이미지 없음
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/projects/${item.projectId}/items/${item.itemId}`}
                        className="line-clamp-2 text-sm font-bold text-slate-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.itemId)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                      >
                        삭제
                      </button>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {formatMoney(item.price)}원
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div>
                        <div className="inline-flex items-center rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              setCartItemQuantity(item.itemId, Math.max(1, item.quantity - 1))
                            }
                            className="h-8 w-8 text-sm font-bold text-slate-700 hover:bg-slate-50"
                            aria-label="수량 감소"
                          >
                            -
                          </button>
                          <span className="grid h-8 min-w-8 place-items-center border-x border-slate-200 px-3 text-sm font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCartItemQuantity(item.itemId, item.quantity + 1)}
                            className="h-8 w-8 text-sm font-bold text-slate-700 hover:bg-slate-50"
                            aria-label="수량 증가"
                          >
                            +
                          </button>
                        </div>
                        {item.mergedByDuplicateAdd && (
                          <p className="mt-2 text-[11px] font-semibold text-primary">
                            동일한 상품을 추가로 담아 기존에 담긴 상품 수량이 변경되었어요.
                            <button
                              type="button"
                              onClick={() => clearMergedNotice(item.itemId)}
                              className="ml-2 underline underline-offset-2"
                            >
                              닫기
                            </button>
                          </p>
                        )}
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        {formatMoney(item.price * item.quantity)}원
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </Reveal>

          <Reveal>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="font-heading text-lg text-slate-900">결제 요약</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>상품 수량</span>
                  <span className="font-semibold">{totalCount}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>총 금액</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatMoney(totalPrice)}원
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {hasNonOpenItem && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    진행중이 아닌 상품이 포함되어 있어요. 해당 상품을 삭제한 뒤 주문해주세요.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={hasNonOpenItem}
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  구매하기
                </button>
                <button
                  type="button"
                  onClick={() => void handleClear()}
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  장바구니 비우기
                </button>
              </div>
            </section>
          </Reveal>
        </div>
      )}
    </div>
  );
}
