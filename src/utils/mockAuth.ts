import type { UserInfo } from '../types/api';

const STORAGE_KEY = 'mock_users';

// 로컬 스토리지에서 사용자 목록 불러오기
export const loadMockUsers = (): UserInfo[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserInfo[];
    }
  } catch (error) {
    console.error('Failed to load mock users:', error);
  }
  return [];
};

// 로컬 스토리지에 사용자 목록 저장
export const saveMockUsers = (users: UserInfo[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save mock users:', error);
  }
};

// 개발 모드에서 mock-users.json 파일에 기록 (Vite dev 서버에서만 동작)
export const persistMockUsersToFile = async (users: UserInfo[]) => {
  // 브라우저에서는 파일 시스템 접근이 불가하므로 dev 서버의 mock 엔드포인트로 전송
  try {
    await fetch('/__mock__/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(users),
    });
  } catch (error) {
    console.warn('Failed to persist mock users to file (dev only):', error);
  }
};

// 서버 연결 전까지 사용할 목업 로그인/회원가입 로직
export const findUserByStudentId = (users: UserInfo[], studentId: string) =>
  users.find((u) => u.studentId === studentId);

export const createMockUser = (
  name: string,
  studentId: string,
  email?: string
): UserInfo => ({
  id: Date.now(),
  name,
  studentId,
  email,
});

// 서버 연결 후 이 모듈을 제거하거나 API 호출로 교체하세요.
