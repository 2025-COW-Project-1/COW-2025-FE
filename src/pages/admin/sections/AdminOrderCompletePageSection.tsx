import { useEffect, useMemo, useState } from 'react';
import Reveal from '../../../components/Reveal';
import { ApiError } from '../../../api/client';
import {
  adminOrderCompletePageApi,
  type AdminOrderCompletePageUpdateInput,
} from '../../../api/orderCompletePage';
import type { OrderCompletePageResponse } from '../../../types/order';

type Props = {
  registerSave: (handler: () => Promise<string | null>) => void;
  onDirtyChange: (dirty: boolean) => void;
};

const INPUT_CLASS =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary/60';

const TEXTAREA_CLASS =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary/60';

const EMPTY_FORM: AdminOrderCompletePageUpdateInput = {
  messageTitle: '',
  messageDescription: '',
  paymentInformation: '',
};

function toFormState(
  response: OrderCompletePageResponse,
): AdminOrderCompletePageUpdateInput {
  return {
    messageTitle: response.content.messageTitle ?? '',
    messageDescription: response.content.messageDescription ?? '',
    paymentInformation:
      (response.content.paymentInformation ??
        [
          response.content.paymentInfo?.bankName,
          response.content.paymentInfo?.accountNumber,
        ]
          .filter(Boolean)
          .join(' ')) ||
      '',
  };
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export default function AdminOrderCompletePageSection({
  registerSave,
  onDirtyChange,
}: Props) {
  const [form, setForm] =
    useState<AdminOrderCompletePageUpdateInput>(EMPTY_FORM);
  const [initialForm, setInitialForm] =
    useState<AdminOrderCompletePageUpdateInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    adminOrderCompletePageApi
      .get()
      .then((response) => {
        if (!active) return;
        const next = toFormState(response);
        setForm(next);
        setInitialForm(next);
      })
      .catch((nextError) => {
        if (!active) return;
        if (nextError instanceof ApiError && nextError.status === 500) {
          setForm(EMPTY_FORM);
          setInitialForm(EMPTY_FORM);
          setWarning('서버에서 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
          return;
        }
        setError(
          toErrorMessage(
            nextError,
            '주문 완료 페이지 설정을 불러오지 못했어요.',
          ),
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    registerSave(async () => {
      if (loading) {
        throw new Error('주문 완료 페이지 설정을 아직 불러오는 중입니다.');
      }
      const saved = await adminOrderCompletePageApi.update(form);
      const next = toFormState(saved);
      setForm(next);
      setInitialForm(next);
      return '주문 완료 페이지 설정을 저장했어요.';
    });
  }, [form, loading, registerSave]);

  const updateField = <K extends keyof AdminOrderCompletePageUpdateInput>(
    key: K,
    value: AdminOrderCompletePageUpdateInput[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Reveal
      id="order-complete-page"
      delayMs={80}
      className="mt-8 rounded-3xl bg-white p-8"
    >
      <h2 className="font-heading text-xl text-slate-900">
        주문 완료 페이지 설정
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        주문 완료 페이지 문구와 결제 정보 내용을 수정합니다.
      </p>

      {loading && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          설정 정보를 불러오는 중...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {warning && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {warning}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-bold text-slate-900">안내 문구</h3>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            메시지 제목
            <input
              value={form.messageTitle}
              onChange={(event) =>
                updateField('messageTitle', event.target.value)
              }
              className={INPUT_CLASS}
              placeholder="예) 주문이 접수되었어요!"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            메시지 설명
            <textarea
              value={form.messageDescription}
              onChange={(event) =>
                updateField('messageDescription', event.target.value)
              }
              className={TEXTAREA_CLASS}
              rows={5}
              placeholder="예) 주문이 접수되었어요. 입금 확인 후 주문이 확정됩니다."
            />
          </label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-bold text-slate-900">
            결제 정보(계좌번호 등)
          </h3>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            <textarea
              value={form.paymentInformation}
              onChange={(event) =>
                updateField('paymentInformation', event.target.value)
              }
              className={TEXTAREA_CLASS}
              rows={6}
              placeholder="예) 국민은행 123456-78-901234 / 예금주: 홍길동"
            />
          </label>
        </section>
      </div>
    </Reveal>
  );
}
