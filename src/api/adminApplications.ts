import { api, withApiBase } from './client';
import { unwrapApiResult } from './types';
import type { ApiResult } from './types';
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
    return api<
      ApiResult<AdminApplicationListItem[]> | AdminApplicationListItem[]
    >(withApiBase(`/admin/forms/${formId}/applications`)).then((res) =>
      unwrapApiResult(res),
    );
  },

  getById(formId: string, applicationId: string) {
    return api<ApiResult<AdminApplicationDetail> | AdminApplicationDetail>(
      withApiBase(`/admin/forms/${formId}/applications/${applicationId}`),
    ).then((res) => unwrapApiResult(res));
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
