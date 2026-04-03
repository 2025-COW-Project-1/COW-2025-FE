import type { OrderDetailResponse } from '../../api/orders';

const STATUS_LABELS: Record<string, string> = {
  PENDING_DEPOSIT: '입금 대기',
  PAID: '입금 완료',
  CANCELED: '주문 취소',
  REFUND_REQUESTED: '환불 요청',
  REFUNDED: '환불 완료',
};

const BUYER_TYPE_LABELS: Record<string, string> = {
  STUDENT: '재학생',
  STAFF: '교직원',
  EXTERNAL: '외부인',
  OUTSIDER: '외부인',
};

const CAMPUS_LABELS: Record<string, string> = {
  SEOUL: '인문캠(서울)',
  YONGIN: '자연캠(용인)',
};

const FULFILLMENT_LABELS: Record<string, string> = {
  PICKUP: '현장 수령',
  DELIVERY: '택배 배송',
};

function formatMoney(value?: number | null) {
  if (value === undefined || value === null) return '-';
  return `${value.toLocaleString()}원`;
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function hasPaymentInfo(paymentInfo: OrderDetailResponse['paymentInfo']) {
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

export default function OrderDetailCard({
  order,
}: {
  order: OrderDetailResponse;
}) {
  const inferredTotalAmount = order.items.reduce((sum, item) => {
    if (typeof item.lineAmount === 'number') return sum + item.lineAmount;
    if (
      typeof item.unitPrice === 'number' &&
      typeof item.quantity === 'number'
    ) {
      return sum + item.unitPrice * item.quantity;
    }
    return sum;
  }, 0);
  const totalAmountToShow =
    order.totalAmount !== undefined
      ? order.totalAmount
      : inferredTotalAmount || undefined;
  const finalAmountToShow =
    order.finalAmount !== undefined
      ? order.finalAmount
      : totalAmountToShow !== undefined && order.shippingFee !== undefined
        ? totalAmountToShow + order.shippingFee
        : totalAmountToShow;
  const paymentInformationText = order.paymentInformation?.trim() ?? '';
  const paymentAmountText =
    order.paymentInfo?.amountLabel ??
    formatMoney(order.paymentInfo?.amount) ??
    formatMoney(finalAmountToShow);
  const shouldShowPaymentSection =
    Boolean(paymentInformationText) ||
    Boolean(order.paymentDescription?.trim()) ||
    hasPaymentInfo(order.paymentInfo);
  const basicRows = [
    { label: '주문번호', value: order.orderNo },
    {
      label: '주문상태',
      value: order.status
        ? (STATUS_LABELS[order.status] ?? order.status)
        : undefined,
    },
    { label: '총 상품금액', value: formatMoney(totalAmountToShow) },
    { label: '배송비', value: formatMoney(order.shippingFee) },
    { label: '최종 결제금액', value: formatMoney(finalAmountToShow) },
    { label: '입금 마감', value: formatDateTime(order.depositDeadline) },
  ].filter((row) => row.value && row.value !== '-');

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">주문 기본 정보</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-slate-700">
          {basicRows.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              표시 가능한 기본 정보가 없어요.
            </div>
          ) : (
            basicRows.map((row) => (
              <div
                key={`basic-${row.label}`}
                className="rounded-xl bg-slate-50 px-3 py-2"
              >
                {row.label}: {row.value}
              </div>
            ))
          )}
        </div>
      </section>

      {shouldShowPaymentSection && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900">
            {order.paymentTitle?.trim() || '입금 계좌 안내'}
          </h3>
          {order.paymentDescription && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {order.paymentDescription}
            </p>
          )}

          {paymentInformationText && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base font-extrabold leading-relaxed text-red-700 shadow-sm">
              {paymentInformationText}
            </div>
          )}

          {(hasPaymentInfo(order.paymentInfo) || paymentAmountText !== '-') && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-slate-700">
              {order.paymentInfo?.bankName && (
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  은행명: {order.paymentInfo.bankName}
                </div>
              )}
              {order.paymentInfo?.accountNumber && (
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  계좌번호: {order.paymentInfo.accountNumber}
                </div>
              )}
              {order.paymentInfo?.accountHolder && (
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  예금주: {order.paymentInfo.accountHolder}
                </div>
              )}
              {paymentAmountText !== '-' && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-center sm:col-span-2">
                  <p className="text-xs font-semibold tracking-wide text-sky-700">
                    입금 금액
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-sky-700">
                    {paymentAmountText}
                  </p>
                </div>
              )}
            </div>
          )}

          {order.paymentInfo?.notice && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-900">
              {order.paymentInfo.notice}
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">주문 상품</h3>
        {order.items.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            주문 상품 정보가 없어요.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {order.items.map((item, index) => (
              <div
                key={`order-item-${index}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">
                  {item.itemName ?? `상품 #${item.projectItemId ?? '-'}`} x{' '}
                  {item.quantity ?? '-'}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatMoney(item.lineAmount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        <h3 className="text-sm font-bold text-slate-900">구매자/수령 정보</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            구매자: {order.buyer?.name ?? '-'}
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            구매자 구분:{' '}
            {order.buyer?.buyerType
              ? (BUYER_TYPE_LABELS[order.buyer.buyerType] ??
                order.buyer.buyerType)
              : '-'}
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            캠퍼스:{' '}
            {order.buyer?.campus
              ? (CAMPUS_LABELS[order.buyer.campus] ?? order.buyer.campus)
              : '-'}
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            연락처: {order.buyer?.phone ?? '-'}
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            수령 방식:{' '}
            {order.fulfillment?.method
              ? (FULFILLMENT_LABELS[order.fulfillment.method] ??
                order.fulfillment.method)
              : '-'}
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            수령자: {order.fulfillment?.receiverName ?? '-'}
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 sm:col-span-2">
            배송지:{' '}
            {order.fulfillment?.addressLine1
              ? `${order.fulfillment.addressLine1} ${order.fulfillment.addressLine2 ?? ''}`.trim()
              : '-'}
          </div>
        </div>
      </section>
    </div>
  );
}
