import { api } from './client';

// ⚠️ 응답 스키마는 swagger의 Response body 보고 맞춰야 함
// 처음엔 최소 필드만 잡고, 추후 확장하면 됨
export type ActiveFormResponse = {
  formId: number;
  title: string;
  description?: string;
  // questions 같은 동적 구조가 있을 가능성이 높음 -> 처음엔 unknown으로
  questions?: unknown;
};

export type ApplyRequest = {
  // swagger에서 요구하는 payload로 맞춰야 함
  // 예: answers: [{ questionId: number, value: string }]
  answers: Array<{ questionId: number; value: string }>;
};

export type ApplyResponse = {
  applicationId: number;
};

export const formsApi = {
  getActiveForm() {
    return api<ActiveFormResponse>('/api/forms/active');
  },
  applyActiveForm(payload: ApplyRequest) {
    return api<ApplyResponse>('/api/forms/active/apply', {
      method: 'POST',
      body: payload,
    });
  },
};
