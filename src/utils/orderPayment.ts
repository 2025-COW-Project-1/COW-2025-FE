import type { OrderCompletePageContent, OrderCompletePaymentInfo } from '../types/order';
import type { OrderDetailResponse } from '../api/orders';

function hasStructuredPaymentInfo(
  paymentInfo: OrderCompletePaymentInfo | null | undefined,
) {
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

export function hasOrderPaymentInfo(order: OrderDetailResponse | null | undefined) {
  if (!order) return false;
  return Boolean(
    order.paymentInformation?.trim() ||
      order.paymentDescription?.trim() ||
      hasStructuredPaymentInfo(order.paymentInfo),
  );
}

export function mergeOrderWithCompletePageContent(
  order: OrderDetailResponse,
  content: OrderCompletePageContent,
): OrderDetailResponse {
  return {
    ...order,
    paymentInformation:
      content.paymentInformation ?? order.paymentInformation,
    paymentTitle: content.paymentTitle ?? order.paymentTitle,
    paymentDescription:
      content.paymentDescription ?? order.paymentDescription,
    paymentInfo: content.paymentInfo ?? order.paymentInfo,
  };
}
