import { api, withApiBase } from './client';
import { unwrapApiResult } from './types';
import type { ApiResult } from './types';

export type ApplicationNotice = {
  noticeId: number | string;
  sectionType?: string | null;
  departmentType?: string | null;
  title?: string | null;
  content?: string | null;
};

export type ApplicationQuestion = {
  formQuestionId: number;
  questionOrder?: number | null;
  content?: string | null;
  description?: string | null;
  answerType?: string | null;
  required?: boolean | null;
  sectionType?: string | null;
  departmentType?: string | null;
  selectOptions?: string | null;
};

export type ApplicationFormResponse = {
  formId: number;
  title?: string | null;
  notices?: ApplicationNotice[] | null;
  questions?: ApplicationQuestion[] | null;
};

export type ApplicationAnswer = {
  formQuestionId: number;
  value: string | null;
};

export type ApplicationCreateRequest = {
  studentId: string;
  password: string;
  firstDepartment: string;
  secondDepartment: string;
  answers: ApplicationAnswer[];
};

export type ApplicationUpdateRequest = ApplicationCreateRequest;

export type ApplicationReadRequest = {
  studentId: string;
  password: string;
};

export type ApplicationReadResponse = {
  editable?: boolean | null;
  applicationId?: number | string | null;
  studentId?: string | null;
  firstDepartment?: string | null;
  secondDepartment?: string | null;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
  commonNotice?: { title?: string | null; content?: string | null } | null;
  firstDepartmentNotice?: {
    title?: string | null;
    content?: string | null;
  } | null;
  secondDepartmentNotice?: {
    title?: string | null;
    content?: string | null;
  } | null;
  commonAnswers?: ApplicationAnswer[] | null;
  firstDepartmentAnswers?: ApplicationAnswer[] | null;
  secondDepartmentAnswers?: ApplicationAnswer[] | null;
  questions?: ApplicationQuestion[] | null;
  notices?: ApplicationNotice[] | null;
};

export type ApplicationResultRequest = {
  studentId: string;
  password: string;
};

export type ApplicationResultResponse = {
  resultStatus?: string | null;
  message?: string | null;
};

export type PresignFileRequest = Array<{
  fileName: string;
  contentType: string;
}>;

export type PresignFileItem = {
  fileName: string;
  key: string;
  uploadUrl: string;
  expiresInSeconds: number;
};

export type PresignFileResponse = {
  items: PresignFileItem[];
};

export const applicationsApi = {
  getForm() {
    return api<ApiResult<ApplicationFormResponse> | ApplicationFormResponse>(
      withApiBase('/application/form'),
    ).then((res) => unwrapApiResult(res));
  },

  create(body: ApplicationCreateRequest) {
    return api<ApiResult<void> | void>(withApiBase('/application'), {
      method: 'POST',
      body,
    }).then((res) => unwrapApiResult(res));
  },

  update(body: ApplicationUpdateRequest) {
    return api<ApiResult<void> | void>(withApiBase('/application'), {
      method: 'PUT',
      body,
    }).then((res) => unwrapApiResult(res));
  },

  read(body: ApplicationReadRequest) {
    return api<ApiResult<ApplicationReadResponse> | ApplicationReadResponse>(
      withApiBase('/application/read'),
      {
        method: 'POST',
        body,
      },
    ).then((res) => unwrapApiResult(res));
  },

  getResult(body: ApplicationResultRequest) {
    return api<
      ApiResult<ApplicationResultResponse> | ApplicationResultResponse
    >(withApiBase('/result'), {
      method: 'POST',
      body,
    }).then((res) => unwrapApiResult(res));
  },

  presignFiles(body: PresignFileRequest) {
    return api<ApiResult<PresignFileResponse> | PresignFileResponse>(
      withApiBase('/forms/files'),
      {
        method: 'POST',
        body,
      },
    ).then((res) => unwrapApiResult(res));
  },
};
