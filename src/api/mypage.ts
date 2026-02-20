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

const wrapData = <T>(data: T): { data: T; message?: string; statusCode?: number } => {
  return { data };
};

export const mypageApi = {
  async getProfile(): Promise<{
    data: MyPageProfile | undefined;
    message?: string;
    statusCode?: number;
  }> {
    const data = await api<MyPageProfile>(withApiBase('/mypage'));
    return wrapData(data);
  },

  async updateProfile(payload: Partial<MyPageProfile>) {
    const data = await api<unknown>(
      withApiBase('/mypage'),
      { method: 'PUT', body: payload }
    );
    return wrapData(data);
  },

  async createAddress(payload: AddressPayload) {
    const data = await api<unknown>(
      withApiBase('/mypage/address'),
      { method: 'POST', body: payload }
    );
    return wrapData(data);
  },

  async updateAddress(payload: AddressPayload) {
    const data = await api<unknown>(
      withApiBase('/mypage/address'),
      { method: 'PUT', body: payload }
    );
    return wrapData(data);
  },

  async deleteAddress() {
    const data = await api<unknown>(
      withApiBase('/mypage/address'),
      { method: 'DELETE' }
    );
    return wrapData(data);
  },
};
