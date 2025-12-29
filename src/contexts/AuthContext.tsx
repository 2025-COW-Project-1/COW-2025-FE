import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserInfo } from '../types/api';
import { storage } from '../utils/storage';
import { AuthContext, type AuthContextType } from './AuthContext.types';
import {
  loadMockUsers,
  saveMockUsers,
  persistMockUsersToFile,
  findUserByStudentId,
  createMockUser,
} from '../utils/mockAuth';

// ============================================
// 서버 연결 시 확인 사항:
// 1. AuthContextType 인터페이스가 백엔드 응답과 일치하는지 확인
// 2. UserInfo 타입이 백엔드 사용자 정보와 일치하는지 확인
// 3. 필요시 src/types/api.ts에서 타입 수정
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mockUsers, setMockUsers] = useState<UserInfo[]>([]);

  // 초기 로드 시 토큰 확인 및 사용자 정보 조회 (목업)
  useEffect(() => {
    const initAuth = async () => {
      const storedUsers = loadMockUsers();
      setMockUsers(storedUsers);

      const token = storage.getToken();
      if (token?.startsWith('mock-token-')) {
        const studentId = token.replace('mock-token-', '');
        const existingUser = findUserByStudentId(storedUsers, studentId);
        if (existingUser) {
          setUser(existingUser);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (studentId: string, _password: string) => {
    void _password; // 비밀번호는 목업에서 검증하지 않음
    // ============================================
    // 개발용 목업 로그인
    // 조건: 학번 8자리, 비밀번호는 아무 값이나 허용
    // ============================================
    if (studentId.length !== 8) {
      throw new Error('학번 8자리를 입력해주세요.');
    }

    const existingUser = findUserByStudentId(mockUsers, studentId);
    const selectedUser =
      existingUser ?? createMockUser('테스트 사용자', studentId, '미지정');

    const mockToken = `mock-token-${studentId}`;
    storage.setToken(mockToken);
    setUser(selectedUser);

    if (!existingUser) {
      const nextUsers = [...mockUsers, selectedUser];
      setMockUsers(nextUsers);
      saveMockUsers(nextUsers);
      persistMockUsersToFile(nextUsers);
    }

    // ============================================
    // 서버 연결 시 사용: 실제 API 호출
    // await authApi.login({ studentId, password });
    // ============================================
  };

  const logout = async () => {
    // ============================================
    // 서버 연결 시 주석 해제: 서버에 로그아웃 요청
    // ============================================
    // try {
    //   await authApi.logout();
    // } catch (error) {
    //   console.error('Logout API error:', error);
    //   // API 실패해도 클라이언트에서는 로그아웃 처리
    // }

    storage.removeToken();
    setUser(null);
  };

  const signup = async (
    name: string,
    studentId: string,
    department: string,
    _password: string
  ) => {
    void _password; // 비밀번호는 목업에서 검증하지 않음
    // ============================================
    // 개발용 목업 회원가입
    // 조건: 학번 8자리, 비밀번호는 아무 값이나 허용
    // ============================================
    if (studentId.length !== 8) {
      throw new Error('학번 8자리를 입력해주세요.');
    }

    const existingUser = findUserByStudentId(mockUsers, studentId);
    if (existingUser) {
      throw new Error('이미 가입된 학번입니다.');
    }

    const newUser = createMockUser(
      name || '테스트 사용자',
      studentId,
      department || '미지정'
    );
    const nextUsers = [...mockUsers, newUser];
    setMockUsers(nextUsers);
    saveMockUsers(nextUsers);
    await persistMockUsersToFile(nextUsers);

    // ============================================
    // 서버 연결 시 사용: 실제 API 호출
    // await authApi.signup({ name, studentId, password });
    // ============================================
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
