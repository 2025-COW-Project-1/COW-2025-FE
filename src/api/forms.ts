import { api } from './client';

export type FormQuestion = {
  id: number;
  orderNo: number;
  label: string;
  description?: string | null;
  required: boolean;
};

export type ActiveFormResponse = {
  formId: number;
  title: string;
  description?: string | null;
  questions: FormQuestion[];
};

export type ApplyRequest = {
  name: string;
  studentNo: string;
  major: string;
  grade: string;
  phone: string;
  answers: Array<{ questionId: number; value: string }>;
};

export type ApplyResponse = {
  applicationId: number;
  resultCode?: string;
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
