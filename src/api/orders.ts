import { api, withApiBase } from './client';

type DateArray = [number, number, number, number?, number?, number?, number?];

export type LookupIdAvailabilityResponse = {
  lookupId: string;
  available: boolean;
  message?: string;
};

export type OrderCreateRequest = {
  lookupId: string;
  password: string;
  depositorName: string;
  privacyAgreed: boolean;
  refundAgreed: boolean;
  cancelRiskAgreed: boolean;
  items: Array<{
    projectItemId: number;
    quantity: number;
  }>;
  buyer: {
    buyerType: 'STUDENT' | 'STAFF' | 'EXTERNAL';
    campus?: 'SEOUL' | 'YONGIN';
    name: string;
    departmentOrMajor?: string;
    studentNo?: string;
    phone: string;
    refundBank: string;
    refundAccount: string;
    referralSource: string;
    email: string;
  };
  fulfillment: {
    method: 'PICKUP' | 'DELIVERY';
    receiverName: string;
    receiverPhone: string;
    infoConfirmed: boolean;
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    deliveryMemo?: string;
  };
};

export type OrderCreateResponse = {
  orderId?: number;
  orderNo?: string;
  status?: string;
  totalAmount?: number;
  shippingFee?: number;
  finalAmount?: number;
  depositDeadline?: string;
  lookupId?: string;
  viewToken?: string;
  raw: unknown;
};

export type OrderLookupRequest = {
  lookupId: string;
  password: string;
};

export type OrderDetailItem = {
  projectItemId?: number;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  lineAmount?: number;
};

export type OrderDetailResponse = {
  orderId?: number;
  orderNo?: string;
  status?: string;
  totalAmount?: number;
  shippingFee?: number;
  finalAmount?: number;
  depositDeadline?: string;
  lookupId?: string;
  depositorName?: string;
  paidAt?: string;
  canceledAt?: string;
  cancelReason?: string;
  refundRequestedAt?: string;
  refundedAt?: string;
  stockDeductedAt?: string;
  buyer?: {
    buyerType?: string;
    campus?: string;
    name?: string;
    departmentOrMajor?: string;
    studentNo?: string;
    phone?: string;
    refundBank?: string;
    refundAccount?: string;
    referralSource?: string;
    email?: string;
  };
  fulfillment?: {
    method?: string;
    receiverName?: string;
    receiverPhone?: string;
    infoConfirmed?: boolean;
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    deliveryMemo?: string;
  };
  items: OrderDetailItem[];
  raw: unknown;
};

function toLookupAvailability(
  lookupId: string,
  raw: unknown,
): LookupIdAvailabilityResponse {
  if (typeof raw === 'boolean') {
    return {
      lookupId,
      available: raw,
    };
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const availableCandidate =
      record.available ?? record.isAvailable ?? record.usable;
    const message =
      typeof record.message === 'string' ? record.message : undefined;

    if (typeof availableCandidate === 'boolean') {
      return {
        lookupId,
        available: availableCandidate,
        message,
      };
    }
  }

  return {
    lookupId,
    available: false,
    message: '조회 아이디 확인 응답을 해석할 수 없어요.',
  };
}

function toOrderCreateResponse(raw: unknown): OrderCreateResponse {
  if (!raw || typeof raw !== 'object') return { raw };

  const record = raw as Record<string, unknown>;
  return {
    orderId:
      typeof record.orderId === 'number'
        ? record.orderId
        : typeof record.order_id === 'number'
          ? record.order_id
          : undefined,
    orderNo:
      typeof record.orderNo === 'string'
        ? record.orderNo
        : typeof record.order_no === 'string'
          ? record.order_no
          : undefined,
    status: typeof record.status === 'string' ? record.status : undefined,
    totalAmount:
      typeof record.totalAmount === 'number'
        ? record.totalAmount
        : typeof record.total_amount === 'number'
          ? record.total_amount
          : undefined,
    shippingFee:
      typeof record.shippingFee === 'number'
        ? record.shippingFee
        : typeof record.shipping_fee === 'number'
          ? record.shipping_fee
          : undefined,
    finalAmount:
      typeof record.finalAmount === 'number'
        ? record.finalAmount
        : typeof record.final_amount === 'number'
          ? record.final_amount
          : undefined,
    depositDeadline: normalizeDateValue(
      record.depositDeadline ?? record.deposit_deadline,
    ),
    lookupId:
      typeof record.lookupId === 'string'
        ? record.lookupId
        : typeof record.lookup_id === 'string'
          ? record.lookup_id
          : undefined,
    viewToken:
      typeof record.viewToken === 'string'
        ? record.viewToken
        : typeof record.view_token === 'string'
          ? record.view_token
          : undefined,
    raw,
  };
}

function asRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  return raw as Record<string, unknown>;
}

function normalizeDateValue(input: unknown): string | undefined {
  if (typeof input === 'string') return input;
  if (!Array.isArray(input)) return undefined;
  if (input.length < 3) return undefined;

  const [year, month, day, hour = 0, minute = 0, second = 0] =
    input as DateArray;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second)
  ) {
    return undefined;
  }

  const yyyy = String(Math.trunc(year)).padStart(4, '0');
  const mm = String(Math.trunc(month)).padStart(2, '0');
  const dd = String(Math.trunc(day)).padStart(2, '0');
  const hh = String(Math.trunc(hour)).padStart(2, '0');
  const mi = String(Math.trunc(minute)).padStart(2, '0');
  const ss = String(Math.trunc(second)).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

function pickString(
  record: Record<string, unknown> | null,
  ...keys: string[]
): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

function pickDateTime(
  record: Record<string, unknown> | null,
  ...keys: string[]
): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const normalized = normalizeDateValue(record[key]);
    if (normalized) return normalized;
  }
  return undefined;
}

function pickNumber(
  record: Record<string, unknown> | null,
  ...keys: string[]
): number | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function pickNumberish(
  record: Record<string, unknown> | null,
  ...keys: string[]
): number | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function pickBoolean(
  record: Record<string, unknown> | null,
  ...keys: string[]
): boolean | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

function toOrderDetailItem(raw: unknown): OrderDetailItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  return {
    projectItemId: pickNumber(
      record,
      'projectItemId',
      'project_item_id',
      'itemId',
    ),
    itemName: pickString(
      record,
      'itemName',
      'item_name',
      'itemNameSnapshot',
      'item_name_snapshot',
      'name',
    ),
    quantity: pickNumber(record, 'quantity'),
    unitPrice: pickNumber(record, 'unitPrice', 'unit_price'),
    lineAmount: pickNumber(record, 'lineAmount', 'line_amount', 'amount'),
  };
}

function toOrderDetailResponse(raw: unknown): OrderDetailResponse {
  const record = asRecord(raw);
  const orderRecord = asRecord(record?.order);
  const summaryRecord = asRecord(record?.summary);
  const infoRecord = orderRecord ?? summaryRecord ?? record;
  const buyerRecord = asRecord(record?.buyer);
  const fulfillmentRecord = asRecord(
    record?.fulfillment ?? record?.delivery ?? record?.shipment,
  );
  const rawItems =
    record?.items ??
    record?.orderItems ??
    record?.lines ??
    orderRecord?.items ??
    orderRecord?.orderItems;
  const items = Array.isArray(rawItems)
    ? rawItems
        .map((item) => toOrderDetailItem(item))
        .filter((item): item is OrderDetailItem => item !== null)
    : [];

  return {
    orderId: pickNumberish(infoRecord, 'orderId', 'order_id', 'id'),
    orderNo: pickString(infoRecord, 'orderNo', 'order_no'),
    status: pickString(infoRecord, 'status', 'orderStatus', 'order_status'),
    totalAmount: pickNumberish(infoRecord, 'totalAmount', 'total_amount'),
    shippingFee: pickNumberish(infoRecord, 'shippingFee', 'shipping_fee'),
    finalAmount: pickNumberish(infoRecord, 'finalAmount', 'final_amount'),
    depositDeadline: pickDateTime(
      infoRecord,
      'depositDeadline',
      'deposit_deadline',
      'deadline',
    ),
    lookupId: pickString(infoRecord, 'lookupId', 'lookup_id'),
    depositorName: pickString(infoRecord, 'depositorName', 'depositor_name'),
    paidAt: pickDateTime(infoRecord, 'paidAt', 'paid_at'),
    canceledAt: pickDateTime(infoRecord, 'canceledAt', 'canceled_at'),
    cancelReason: pickString(infoRecord, 'cancelReason', 'cancel_reason'),
    refundRequestedAt: pickDateTime(
      infoRecord,
      'refundRequestedAt',
      'refund_requested_at',
    ),
    refundedAt: pickDateTime(infoRecord, 'refundedAt', 'refunded_at'),
    stockDeductedAt: pickDateTime(
      infoRecord,
      'stockDeductedAt',
      'stock_deducted_at',
    ),
    buyer: buyerRecord
      ? {
          buyerType: pickString(buyerRecord, 'buyerType', 'buyer_type'),
          campus: pickString(buyerRecord, 'campus'),
          name: pickString(buyerRecord, 'name'),
          departmentOrMajor: pickString(
            buyerRecord,
            'departmentOrMajor',
            'department_or_major',
          ),
          studentNo: pickString(buyerRecord, 'studentNo', 'student_no'),
          phone: pickString(buyerRecord, 'phone'),
          refundBank: pickString(buyerRecord, 'refundBank', 'refund_bank'),
          refundAccount: pickString(
            buyerRecord,
            'refundAccount',
            'refund_account',
          ),
          referralSource: pickString(
            buyerRecord,
            'referralSource',
            'referral_source',
          ),
          email: pickString(buyerRecord, 'email'),
        }
      : undefined,
    fulfillment: fulfillmentRecord
      ? {
          method: pickString(fulfillmentRecord, 'method'),
          receiverName: pickString(
            fulfillmentRecord,
            'receiverName',
            'receiver_name',
          ),
          receiverPhone: pickString(
            fulfillmentRecord,
            'receiverPhone',
            'receiver_phone',
          ),
          infoConfirmed: pickBoolean(
            fulfillmentRecord,
            'infoConfirmed',
            'info_confirmed',
          ),
          postalCode: pickString(
            fulfillmentRecord,
            'postalCode',
            'postal_code',
          ),
          addressLine1: pickString(
            fulfillmentRecord,
            'addressLine1',
            'address_line1',
          ),
          addressLine2: pickString(
            fulfillmentRecord,
            'addressLine2',
            'address_line2',
          ),
          deliveryMemo: pickString(
            fulfillmentRecord,
            'deliveryMemo',
            'delivery_memo',
          ),
        }
      : undefined,
    items,
    raw,
  };
}

export const ordersApi = {
  async checkLookupIdAvailability(lookupId: string) {
    const trimmed = lookupId.trim();
    const data = await api<unknown>(
      withApiBase(
        `/orders/lookup-id/availability?lookupId=${encodeURIComponent(trimmed)}`,
      ),
    );
    return toLookupAvailability(trimmed, data);
  },

  async createOrder(payload: OrderCreateRequest) {
    const data = await api<unknown>(
      withApiBase('/orders'),
      {
        method: 'POST',
        body: payload,
      },
    );
    return toOrderCreateResponse(data);
  },

  async lookupOrder(payload: OrderLookupRequest) {
    const data = await api<unknown>(
      withApiBase('/orders/lookup'),
      {
        method: 'POST',
        body: payload,
      },
    );
    return toOrderDetailResponse(data);
  },

  async viewOrder(token: string) {
    const trimmed = token.trim();
    const data = await api<unknown>(
      withApiBase(`/orders/view?token=${encodeURIComponent(trimmed)}`),
    );
    return toOrderDetailResponse(data);
  },
};
