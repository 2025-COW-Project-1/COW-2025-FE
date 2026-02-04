import { api, withApiBase } from './client';

export type Campus = 'SEOUL' | 'YONGIN';
export type AcademicStatus =
  | 'ENROLLED'
  | 'LEAVE'
  | 'GRADUATED'
  | 'STAFF'
  | 'EXTERNAL';
export type Gender = 'MALE' | 'FEMALE' | 'NONE';

export type AddressPayload = {
  recipientName: string;
  phoneNumber: string;
  postCode: string;
  address: string;
};

export type MyPageProfile = {
  memberId?: number;
  userName: string;
  email: string;
  phoneNumber?: string;
  studentId?: string;
  campus?: Campus;
  major?: string;
  birthDate?: string;
  gender?: Gender;
  academicStatus?: AcademicStatus;
  grade?: string;
  socialProvider?: string;
  address?: AddressPayload | null;
};

export type ApiResponse<T> = {
  resultType?: string;
  httpStatusCode?: number;
  message?: string;
  data?: T;
};

const unwrap = <T>(
  raw: ApiResponse<T> | T
): { data: T; message?: string; statusCode?: number } => {
  if (raw && typeof raw === 'object' && raw !== null && 'data' in raw) {
    const r = raw as ApiResponse<T>;
    return {
      data: r.data as T,
      message: r.message,
      statusCode: r.httpStatusCode,
    };
  }
  return { data: raw as T };
};

export const mypageApi = {
  async getProfile(): Promise<{
    data: MyPageProfile | undefined;
    message?: string;
    statusCode?: number;
  }> {
    const raw = await api<ApiResponse<MyPageProfile> | MyPageProfile>(
      withApiBase('/mypage')
    );
    return unwrap(raw);
  },

  async updateProfile(payload: Partial<MyPageProfile>) {
    const raw = await api<ApiResponse<unknown> | unknown>(
      withApiBase('/mypage'),
      { method: 'PUT', body: payload }
    );
    return unwrap(raw);
  },

  async createAddress(payload: AddressPayload) {
    const raw = await api<ApiResponse<unknown> | unknown>(
      withApiBase('/mypage/address'),
      { method: 'POST', body: payload }
    );
    return unwrap(raw);
  },

  async updateAddress(payload: AddressPayload) {
    const raw = await api<ApiResponse<unknown> | unknown>(
      withApiBase('/mypage/address'),
      { method: 'PUT', body: payload }
    );
    return unwrap(raw);
  },

  async deleteAddress() {
    const raw = await api<ApiResponse<unknown> | unknown>(
      withApiBase('/mypage/address'),
      { method: 'DELETE' }
    );
    return unwrap(raw);
  },
};
