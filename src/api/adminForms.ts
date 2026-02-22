import { api, withApiBase } from './client';
import { unwrapApiResult } from './types';
import type { ApiResult } from './types';

// ---- 1. Form 목록 조회 (GET /admin/forms) ----
export type AdminFormListItem = {
  formId: number;
  title: string;
  open: boolean;
};

// ---- 2. Form 단건 조회 (GET /admin/forms/{formId}) ----
export type AdminFormNoticeItem = {
  noticeId: number;
  sectionType: string;
  departmentType: string;
  title: string;
  content: string;
};

export type AdminFormQuestionInDetail = {
  formQuestionId: number;
  questionOrder: number;
  content: string;
  answerType: string;
  required: boolean;
};

export type AdminFormDetail = {
  formId: number;
  title: string;
  open: boolean;
  notices: AdminFormNoticeItem[];
  questions: AdminFormQuestionInDetail[];
};

// ---- 3. Form 문항 목록 조회 (GET /admin/forms/{formId}/questions) ----
export type AdminFormQuestion = {
  formQuestionId: number;
  questionId: number;
  label: string;
  description: string;
  questionOrder: number;
  required: boolean;
  answerType: string;
  selectOptions: string;
  sectionType: string;
  departmentType: string | null;
};

// ---- 4. Form 생성 (POST /admin/forms) ----
export type AdminFormCreateRequest = {
  title: string;
  open: boolean;
};

// ---- 5. 문항 복사 (POST /admin/forms/{targetFormId}/copy) ----
export type AdminFormCopyQuestionsRequest = {
  sourceFormId: number;
};

export type AdminFormCopyResponse = {
  targetFormId: number;
  sourceFormId: number;
  copiedCount: number;
};

// ---- 6. 문항 추가 (POST /admin/forms/{formId}/questions) ----
export type AdminFormQuestionCreateRequest = {
  label: string;
  description: string;
  questionOrder: number;
  required: boolean;
  answerType: string;
  selectOptions: string | null;
  sectionType: string;
  departmentType: string | null;
};

export type AdminFormQuestionAddResponse = {
  questionId: number;
  formQuestionId: number;
};

export type AdminFormQuestionUpdateRequest = AdminFormQuestionCreateRequest;

// ---- 7. 안내문 추가 (POST /admin/forms/{formId}/notices) ----
export type AdminFormNoticeCreateRequest = {
  sectionType: string;
  departmentType: string | null;
  title: string;
  content: string;
};

export type AdminFormNoticeAddResponse = {
  noticeId: number;
};

export type AdminFormNoticeUpdateRequest = AdminFormNoticeCreateRequest;

/** 안내문 수정/응답용 (단건) */
export type AdminFormNotice = AdminFormNoticeItem;

/** PUT 문항 수정 / Form OPEN·CLOSE / PUT 안내문 수정 등 200 성공 시 data: {} */
export type AdminFormEmptyData = Record<string, never>;

export const adminFormsApi = {
  /** Form 목록 조회 */
  list() {
    return api<ApiResult<AdminFormListItem[]> | AdminFormListItem[]>(
      withApiBase('/admin/forms')
    ).then((res) => unwrapApiResult(res));
  },

  /** Form 단건 조회 */
  getById(formId: string) {
    return api<ApiResult<AdminFormDetail> | AdminFormDetail>(
      withApiBase(`/admin/forms/${formId}`)
    ).then((res) => unwrapApiResult(res));
  },

  /** Form 문항 목록 조회 */
  getQuestions(formId: string) {
    return api<ApiResult<AdminFormQuestion[]> | AdminFormQuestion[]>(
      withApiBase(`/admin/forms/${formId}/questions`)
    ).then((res) => unwrapApiResult(res));
  },

  /** Form 생성 */
  create(body: AdminFormCreateRequest) {
    return api<ApiResult<AdminFormDetail> | AdminFormDetail>(
      withApiBase('/admin/forms'),
      { method: 'POST', body }
    ).then((res) => unwrapApiResult(res));
  },

  /** 문항 복사(덮어쓰기) */
  copyQuestions(
    targetFormId: string,
    body: AdminFormCopyQuestionsRequest
  ) {
    return api<ApiResult<AdminFormCopyResponse> | AdminFormCopyResponse>(
      withApiBase(`/admin/forms/${targetFormId}/copy`),
      { method: 'POST', body }
    ).then((res) => unwrapApiResult(res));
  },

  /** 문항 추가 */
  addQuestion(formId: string, body: AdminFormQuestionCreateRequest) {
    return api<
      ApiResult<AdminFormQuestionAddResponse> | AdminFormQuestionAddResponse
    >(withApiBase(`/admin/forms/${formId}/questions`), {
      method: 'POST',
      body,
    }).then((res) => unwrapApiResult(res));
  },

  /**
   * Form 문항 수정 (PUT /admin/forms/{formId}/questions/{formQuestionId})
   * - 400: 규칙 위반/Form 불일치, 404: FormQuestion 없음
   */
  updateQuestion(
    formId: string,
    formQuestionId: string,
    body: AdminFormQuestionUpdateRequest
  ) {
    return api<ApiResult<AdminFormEmptyData> | AdminFormEmptyData>(
      withApiBase(`/admin/forms/${formId}/questions/${formQuestionId}`),
      { method: 'PUT', body }
    ).then((res) => unwrapApiResult(res));
  },

  /**
   * Form 문항 삭제 (DELETE /admin/forms/{formId}/questions/{formQuestionId})
   * - 400: Form 불일치, 404: FormQuestion 없음
   */
  deleteQuestion(formId: string, formQuestionId: string) {
    return api<void>(
      withApiBase(`/admin/forms/${formId}/questions/${formQuestionId}`),
      { method: 'DELETE' }
    );
  },

  /**
   * Form OPEN (PUT /admin/forms/{formId}/open)
   * 지정한 Form을 OPEN 상태로 변경합니다. 다른 OPEN Form이 있으면 close 처리합니다.
   * - 404: Form 없음
   */
  open(formId: string) {
    return api<ApiResult<AdminFormEmptyData> | AdminFormEmptyData>(
      withApiBase(`/admin/forms/${formId}/open`),
      { method: 'PUT' }
    ).then((res) => unwrapApiResult(res));
  },

  /**
   * Form CLOSE (PUT /admin/forms/{formId}/close)
   * 지정한 Form을 CLOSE 상태로 변경합니다.
   * - 404: Form 없음
   */
  close(formId: string) {
    return api<ApiResult<AdminFormEmptyData> | AdminFormEmptyData>(
      withApiBase(`/admin/forms/${formId}/close`),
      { method: 'PUT' }
    ).then((res) => unwrapApiResult(res));
  },

  /** 안내문 추가 */
  addNotice(formId: string, body: AdminFormNoticeCreateRequest) {
    return api<
      ApiResult<AdminFormNoticeAddResponse> | AdminFormNoticeAddResponse
    >(withApiBase(`/admin/forms/${formId}/notices`), {
      method: 'POST',
      body,
    }).then((res) => unwrapApiResult(res));
  },

  /**
   * 안내문 수정 (PUT /admin/forms/{formId}/notices/{noticeId})
   * 기존 안내문의 내용, 섹션 타입, 학과 설정을 수정합니다.
   * - 400: 규칙 위반/Form 불일치, 404: FormNotice 없음
   */
  updateNotice(
    formId: string,
    noticeId: string,
    body: AdminFormNoticeUpdateRequest
  ) {
    return api<ApiResult<AdminFormEmptyData> | AdminFormEmptyData>(
      withApiBase(`/admin/forms/${formId}/notices/${noticeId}`),
      { method: 'PUT', body }
    ).then((res) => unwrapApiResult(res));
  },

  /**
   * 안내문 삭제 (DELETE /admin/forms/{formId}/notices/{noticeId})
   * 특정 안내문을 삭제합니다.
   * - 400: Form 불일치, 404: FormNotice 없음
   */
  deleteNotice(formId: string, noticeId: string) {
    return api<void>(
      withApiBase(`/admin/forms/${formId}/notices/${noticeId}`),
      { method: 'DELETE' }
    );
  },
};
