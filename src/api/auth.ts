import axiosInstance from './axios';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  UserInfo,
} from '../types/api';

// 로그인
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  // ============================================
  // 서버 연결 시 사용: 실제 API 엔드포인트
  // 백엔드 API 엔드포인트가 다르면 '/auth/login' 부분 수정
  // ============================================
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    data
  );

  // ============================================
  // 서버 응답 형식 확인 필요
  // 백엔드 응답 형식이 다르면 아래 코드 수정 필요
  // 예: response.data.data 대신 response.data 직접 사용 등
  // ============================================
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || '로그인에 실패했습니다.');
};

// 회원가입
export const signup = async (data: SignupRequest): Promise<void> => {
  // ============================================
  // 서버 연결 시 사용: 실제 API 엔드포인트
  // 백엔드 API 엔드포인트가 다르면 '/auth/signup' 부분 수정
  // ============================================
  const response = await axiosInstance.post<ApiResponse>('/auth/signup', data);

  // ============================================
  // 서버 응답 형식 확인 필요
  // 백엔드 응답 형식이 다르면 아래 코드 수정 필요
  // ============================================
  if (!response.data.success) {
    throw new Error(response.data.message || '회원가입에 실패했습니다.');
  }
};

// 현재 사용자 정보 조회
export const getCurrentUser = async (): Promise<UserInfo> => {
  // ============================================
  // 서버 연결 시 사용: 실제 API 엔드포인트
  // 백엔드 API 엔드포인트가 다르면 '/auth/me' 부분 수정
  // 예: '/auth/user', '/user/me' 등
  // ============================================
  const response = await axiosInstance.get<ApiResponse<UserInfo>>('/auth/me');

  // ============================================
  // 서버 응답 형식 확인 필요
  // 백엔드 응답 형식이 다르면 아래 코드 수정 필요
  // ============================================
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    response.data.message || '사용자 정보를 가져오는데 실패했습니다.'
  );
};

// 로그아웃
export const logout = async (): Promise<void> => {
  // ============================================
  // 서버 연결 시 사용: 실제 API 엔드포인트
  // 백엔드 API 엔드포인트가 다르면 '/auth/logout' 부분 수정
  // ============================================
  try {
    await axiosInstance.post<ApiResponse>('/auth/logout');
  } catch (error) {
    // 로그아웃 API가 실패해도 클라이언트에서는 로그아웃 처리
    console.error('Logout API error:', error);
  }
};
