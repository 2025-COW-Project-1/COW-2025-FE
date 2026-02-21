import { api, withApiBase } from './client';
import type { DepartmentType } from '../types/recruit';

export type AdminApplicationResultStatus = 'PASS' | 'FAIL' | 'NOT_PUBLISHED';

export type AdminApplicationListItem = {
  applicationId: number;
  studentId: string;
  firstDepartment: DepartmentType;
  secondDepartment: DepartmentType;
  resultStatus: AdminApplicationResultStatus;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
};

export type AdminApplicationDetail = {
  applicationId: number;
  studentId: string;
  firstDepartment: DepartmentType;
  secondDepartment: DepartmentType;
  resultStatus: AdminApplicationResultStatus;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
  commonAnswers?: Array<{ formQuestionId: number; value: string | null }>;
  firstDepartmentAnswers?: Array<{
    formQuestionId: number;
    value: string | null;
  }>;
  secondDepartmentAnswers?: Array<{
    formQuestionId: number;
    value: string | null;
  }>;
};

export type AdminApplicationResultUpdateRequest = {
  resultStatus: AdminApplicationResultStatus;
};

export const adminApplicationsApi = {
  list(formId: string) {
    return api<AdminApplicationListItem[]>(
      withApiBase(`/admin/forms/${formId}/applications`),
    );
  },

  getById(formId: string, applicationId: string) {
    return api<AdminApplicationDetail>(
      withApiBase(`/admin/forms/${formId}/applications/${applicationId}`),
    );
  },

  updateResult(
    applicationId: string,
    body: AdminApplicationResultUpdateRequest,
  ) {
    return api<void>(
      withApiBase(`/admin/applications/${applicationId}/result`),
      {
        method: 'PUT',
        body,
      },
    );
  },

  delete(applicationId: string) {
    return api<void>(withApiBase(`/admin/applications/${applicationId}`), {
      method: 'DELETE',
    });
  },
};
