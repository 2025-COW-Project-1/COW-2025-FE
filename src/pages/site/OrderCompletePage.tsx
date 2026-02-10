import { Link, useLocation } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { useToast } from '../../components/toast/useToast';

type OrderCompleteState = {
  orderNo?: string;
  status?: string;
  lookupId?: string;
  depositDeadline?: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_DEPOSIT: '입금 대기',
  PAID: '입금 완료',
  CANCELED: '주문 취소',
  REFUND_REQUESTED: '환불 요청',
  REFUNDED: '환불 완료',
};

export default function OrderCompletePage() {
  const location = useLocation();
  const toast = useToast();
  const state = (location.state ?? {}) as OrderCompleteState;

  const statusLabel = state.status
    ? (STATUS_LABELS[state.status] ?? state.status)
    : '-';
  const depositDeadlineText = resolveDepositDeadlineText(
    state.depositDeadline,
    state.orderNo,
  );
  const canCopyLookupId = Boolean(
    state.lookupId && state.lookupId.trim().length > 0,
  );

  const copyLookupId = async () => {
    if (!canCopyLookupId) return;
    try {
      await navigator.clipboard.writeText(state.lookupId!.trim());
      toast.success('조회 아이디를 복사했어요.');
    } catch {
      toast.error('복사에 실패했어요. 직접 입력해주세요.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Reveal>
        <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <p className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
            ORDER RECEIVED
          </p>
          <h1 className="mt-3 font-heading text-3xl text-emerald-900">
            주문이 접수되었어요
          </h1>
          <p className="mt-2 text-sm text-emerald-800">
            아래 입금 마감 시간 전까지 입금을 완료하면 주문이 확정됩니다.
          </p>
        </section>
      </Reveal>

      <Reveal className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">주문 핵심 정보</h2>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            주문번호: {state.orderNo ?? '-'}
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            주문상태: {statusLabel}
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span>조회 아이디: {state.lookupId ?? '-'}</span>
            {canCopyLookupId && (
              <button
                type="button"
                onClick={() => void copyLookupId()}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                복사
              </button>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            입금 마감: {depositDeadlineText}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">다음 단계 안내</p>
          <ol className="mt-2 space-y-1 text-sm text-amber-900/90">
            <li>1. 입금 완료 후 주문 상태가 업데이트됩니다.</li>
            <li>2. 조회 아이디 + 비밀번호로 주문 조회가 가능합니다.</li>
            <li>3. 이메일로도 주문 조회 링크를 확인할 수 있어요.</li>
          </ol>
        </div>

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
    </div>
  );
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
