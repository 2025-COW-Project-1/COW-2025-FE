import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import type { ApiError } from '../types/api';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ============================================
    // 서버 연결 시 사용: 모든 요청에 토큰 자동 추가
    // 백엔드에서 다른 형식의 인증 헤더를 사용하면 수정 필요
    // 예: 'Token ${token}', 'X-Auth-Token: ${token}' 등
    // ============================================
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // ============================================
    // 서버 연결 시 사용: 401 에러 처리 (토큰 만료)
    // 백엔드에서 다른 상태 코드를 사용하면 수정 필요
    // ============================================
    // 401 Unauthorized: 토큰 만료 또는 인증 실패
    if (error.response?.status === 401) {
      storage.removeToken();
      // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닐 때만)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    // ============================================
    // 서버 연결 시 확인: 에러 응답 형식
    // 백엔드 에러 응답 형식이 다르면 아래 코드 수정 필요
    // ============================================
    // 에러 응답 처리
    const apiError: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        '알 수 없는 오류가 발생했습니다.',
      code: error.response?.data?.code || error.response?.status,
      status: error.response?.status,
    };

    return Promise.reject(apiError);
  }
);

export default instance;
