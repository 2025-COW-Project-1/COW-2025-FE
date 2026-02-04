export type Campus = 'SEOUL' | 'YONGIN' | '';
export type AcademicStatus =
  | 'ENROLLED'
  | 'LEAVE'
  | 'GRADUATED'
  | 'STAFF'
  | 'EXTERNAL'
  | '';
export type Gender = 'MALE' | 'FEMALE' | 'NONE' | '';

export type AddressForm = {
  recipientName: string;
  phoneNumber: string;
  postCode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
};

export type ProfileForm = {
  name: string;
  birthDate: string;
  phoneNumber: string;
  studentId: string;
  campus: Campus;
  major: string;
  grade: string;
  academicStatus: AcademicStatus;
  gender: Gender;
  memo: string;

  email: string;
  socialProvider: string;

  address: AddressForm;
};

export const DEFAULT_FORM: ProfileForm = {
  name: '',
  birthDate: '',
  phoneNumber: '',
  studentId: '',
  campus: '',
  major: '',
  grade: '',
  academicStatus: '',
  gender: '',

  memo: '',

  email: '',
  socialProvider: '',

  address: {
    recipientName: '',
    phoneNumber: '',
    postCode: '',
    address1: '',
    address2: '',
    isDefault: true,
  },
};
