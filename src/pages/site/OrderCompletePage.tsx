import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import type {
  OrderCompletePageContent,
  OrderCompleteItem,
  OrderCompletePaymentInfo,
} from '../../types/order';
import {
  isOrderCompletePageNotFoundError,
  orderCompletePageApi,
} from '../../api/orderCompletePage';
import Reveal from '../../components/Reveal';
import { useToast } from '../../components/toast/useToast';

type OrderCompleteState = {
  orderNo?: string;
  status?: string;
  lookupId?: string;
  depositDeadline?: string;
  viewToken?: string;
};

type DisplayOrder = {
  orderNo?: string;
  status?: string;
  lookupId?: string;
  depositDeadline?: string;
  createdAt?: string;
  totalAmount?: number;
  shippingFee?: number;
  finalAmount?: number;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_DEPOSIT: '입금 대기',
  PAID: '입금 완료',
  CANCELED: '주문 취소',
  REFUND_REQUESTED: '환불 요청',
  REFUNDED: '환불 완료',
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function formatMoney(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return `${value.toLocaleString('ko-KR')}원`;
}

function resolveDepositDeadlineText(
  raw: string | undefined,
  orderNo: string | undefined,
) {
  if (raw && raw.trim().length > 0) return formatDateTime(raw);

  const fromOrderNo = parseOrderNoDate(orderNo);
  const base = fromOrderNo ?? new Date();
  const deadline = new Date(base);
  deadline.setDate(deadline.getDate() + 1);
  deadline.setHours(23, 59, 0, 0);
  return formatDateTime(deadline.toISOString());
}

function parseOrderNoDate(orderNo: string | undefined) {
  if (!orderNo) return null;
  const match = orderNo.match(/(\d{14})/);
  if (!match) return null;
  const value = match[1];
  const yyyy = Number(value.slice(0, 4));
  const mm = Number(value.slice(4, 6));
  const dd = Number(value.slice(6, 8));
  const hh = Number(value.slice(8, 10));
  const mi = Number(value.slice(10, 12));
  const ss = Number(value.slice(12, 14));
  if (
    !Number.isFinite(yyyy) ||
    !Number.isFinite(mm) ||
    !Number.isFinite(dd) ||
    !Number.isFinite(hh) ||
    !Number.isFinite(mi) ||
    !Number.isFinite(ss)
  ) {
    return null;
  }
  return new Date(yyyy, mm - 1, dd, hh, mi, ss);
}

function hasPaymentInfo(paymentInfo: OrderCompletePaymentInfo | null | undefined) {
  if (!paymentInfo) return false;
  return Boolean(
    paymentInfo.bankName ||
      paymentInfo.accountNumber ||
      paymentInfo.accountHolder ||
      paymentInfo.amountLabel ||
      paymentInfo.notice ||
      paymentInfo.amount !== undefined,
  );
}

function PaymentInfoCard({
  content,
  finalAmount,
}: {
  content: OrderCompletePageContent;
  finalAmount?: number;
}) {
  const paymentInfo = content.paymentInfo;
  const paymentInformationText = content.paymentInformation?.trim() ?? '';
  const amountText =
    paymentInfo?.amountLabel ??
    formatMoney(paymentInfo?.amount) ??
    formatMoney(finalAmount) ??
    null;
  const hasStructuredPaymentInfo =
    hasPaymentInfo(paymentInfo) || Boolean(amountText);

  if (
    !paymentInformationText &&
    !hasStructuredPaymentInfo &&
    !content.paymentDescription
  ) {
    return null;
  }

  return (
    <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        {content.paymentTitle?.trim() || '입금 계좌 안내'}
      </h2>
      {content.paymentDescription && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {content.paymentDescription}
        </p>
      )}

      {paymentInformationText && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-base font-extrabold leading-relaxed text-red-700 shadow-sm">
          {paymentInformationText}
        </div>
      )}

      {hasStructuredPaymentInfo && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {paymentInfo?.bankName && (
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              은행명: {paymentInfo.bankName}
            </div>
          )}
          {paymentInfo?.accountNumber && (
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              계좌번호: {paymentInfo.accountNumber}
            </div>
          )}
          {paymentInfo?.accountHolder && (
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              예금주: {paymentInfo.accountHolder}
            </div>
          )}
          {amountText && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-center sm:col-span-2">
              <p className="text-xs font-semibold tracking-wide text-sky-700">
                입금 금액
              </p>
              <p className="mt-1 text-xl font-extrabold text-sky-700">
                {amountText}
              </p>
            </div>
          )}
        </div>
      )}

      {paymentInfo?.notice && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          {paymentInfo.notice}
        </div>
      )}
    </Reveal>
  );
}

export default function OrderCompletePage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const state = (location.state ?? {}) as OrderCompleteState;
  const queryToken = searchParams.get('token')?.trim() ?? '';
  const token = queryToken || state.viewToken?.trim() || '';

  const [loading, setLoading] = useState(Boolean(token));
  const [pageContent, setPageContent] = useState<OrderCompletePageContent>({});
  const [items, setItems] = useState<OrderCompleteItem[]>([]);
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder>({
    orderNo: state.orderNo,
    status: state.status,
    lookupId: state.lookupId,
    depositDeadline: state.depositDeadline,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setErrorMessage(null);

    orderCompletePageApi
      .getByToken(token)
      .then((result) => {
        if (!active) return;
        setPageContent(result.content);
        setItems(result.items);
        setDisplayOrder((prev) => ({
          orderNo: result.order?.orderNo ?? prev.orderNo,
          status: result.order?.status ?? prev.status,
          lookupId: result.order?.lookupId ?? prev.lookupId,
          depositDeadline: result.order?.depositDeadline ?? prev.depositDeadline,
          createdAt: result.order?.createdAt ?? prev.createdAt,
          totalAmount: result.order?.totalAmount ?? prev.totalAmount,
          shippingFee: result.order?.shippingFee ?? prev.shippingFee,
          finalAmount: result.order?.finalAmount ?? prev.finalAmount,
        }));
      })
      .catch((error) => {
        if (!active) return;

        const nextMessage = isOrderCompletePageNotFoundError(error)
          ? '주문 완료 페이지 정보를 찾지 못했어요. 발급받은 링크가 만료되었거나 유효하지 않을 수 있어요.'
          : error instanceof Error
            ? error.message
            : '주문 완료 페이지를 불러오지 못했어요.';
        setErrorMessage(nextMessage);

        if (!state.orderNo) {
          toast.error(nextMessage);
        }
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [state.orderNo, toast, token]);

  const statusLabel = displayOrder.status
    ? (STATUS_LABELS[displayOrder.status] ?? displayOrder.status)
    : '-';
  const depositDeadlineText = resolveDepositDeadlineText(
    displayOrder.depositDeadline,
    displayOrder.orderNo,
  );
  const canCopyLookupId = Boolean(
    displayOrder.lookupId && displayOrder.lookupId.trim().length > 0,
  );
  const totalQuantity = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (typeof item.quantity !== 'number') return sum;
        return sum + item.quantity;
      }, 0),
    [items],
  );
  const summaryRows = useMemo(
    () =>
      [
        { label: '주문번호', value: displayOrder.orderNo ?? '-' },
        { label: '주문상태', value: statusLabel },
        {
          label: '주문일',
          value: displayOrder.createdAt
            ? formatDateTime(displayOrder.createdAt)
            : '-',
        },
        { label: '입금 마감', value: depositDeadlineText },
        {
          label: '총 상품금액',
          value: formatMoney(displayOrder.totalAmount) ?? '-',
        },
        { label: '배송비', value: formatMoney(displayOrder.shippingFee) ?? '-' },
        {
          label: '최종 결제금액',
          value: formatMoney(displayOrder.finalAmount) ?? '-',
        },
      ],
    [depositDeadlineText, displayOrder, statusLabel],
  );

  const copyLookupId = async () => {
    if (!canCopyLookupId) return;
    try {
      await navigator.clipboard.writeText(displayOrder.lookupId!.trim());
      toast.success('조회 아이디를 복사했어요.');
    } catch {
      toast.error('복사에 실패했어요. 직접 입력해주세요.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Reveal>
        <section className="rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-6 shadow-sm">
          <p className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
            ORDER RECEIVED
          </p>
          <h1 className="mt-3 font-heading text-3xl text-emerald-900">
            {pageContent.messageTitle?.trim() || '주문이 접수되었어요'}
          </h1>
          {pageContent.messageDescription ? (
            <p className="mt-2 text-sm leading-relaxed text-emerald-800">
              {pageContent.messageDescription}
            </p>
          ) : (
            <p className="mt-2 text-sm text-emerald-800">
              아래 입금 마감 시간 전까지 입금을 완료하면 주문이 확정됩니다.
            </p>
          )}
          {loading && (
            <p className="mt-3 text-sm font-semibold text-emerald-900">
              주문 완료 페이지 정보를 불러오는 중...
            </p>
          )}
        </section>
      </Reveal>

      {errorMessage && (
        <Reveal className="mt-6 rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm leading-relaxed text-rose-700">{errorMessage}</p>
        </Reveal>
      )}

      <PaymentInfoCard
        content={pageContent}
        finalAmount={displayOrder.finalAmount}
      />

      <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">주문 핵심 정보</h2>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {summaryRows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {row.label}: {row.value}
            </div>
          ))}
          {canCopyLookupId && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 sm:col-span-2">
              <span>조회 아이디: {displayOrder.lookupId ?? '-'}</span>
              <button
                type="button"
                onClick={() => void copyLookupId()}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                복사
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">다음 단계 안내</p>
          <ol className="mt-2 space-y-1 text-sm text-amber-900/90">
            <li>1. 입금 완료 후 주문 상태가 업데이트됩니다.</li>
            <li>2. 조회 아이디 + 비밀번호로 주문 조회가 가능합니다.</li>
            <li>3. 이메일 링크 또는 주문 조회 페이지로 다시 확인할 수 있어요.</li>
          </ol>
        </div>

        {!token && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            조회 토큰이 없어 기본 주문 정보만 표시 중입니다. 이후에는 발급된 링크 기준으로 주문 완료 페이지가 열립니다.
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/orders/lookup"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white hover:opacity-95"
          >
            주문 조회하러 가기
          </Link>
          <Link
            to="/projects"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            상품 페이지로 이동
          </Link>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            홈으로 이동
          </Link>
        </div>
      </Reveal>

      {items.length > 0 && (
        <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">주문 내역</h2>
          <div className="mt-4 space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.projectItemId ?? 'item'}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.itemName ?? `상품 #${item.projectItemId ?? '-'}`}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      수량 {item.quantity ?? '-'}개
                      {typeof item.unitPrice === 'number' &&
                        ` · 단가 ${formatMoney(item.unitPrice)}`}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {formatMoney(item.lineAmount) ?? '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              총 수량: {totalQuantity}개
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
              총 결제금액: {formatMoney(displayOrder.finalAmount) ?? '-'}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
