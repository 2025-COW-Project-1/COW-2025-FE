// 공통 API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string | number;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

// 에러 응답 타입
export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
}

// 로그인 요청 타입
export interface LoginRequest {
  studentId: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserInfo;
}

// 회원가입 요청 타입
export interface SignupRequest {
  name: string;
  studentId: string;
  department: string;
  password: string;
}

// 사용자 정보 타입
export interface UserInfo {
  id: number;
  studentId: string;
  name: string;
  department?: string;
  email?: string;
  role?: string;
}
