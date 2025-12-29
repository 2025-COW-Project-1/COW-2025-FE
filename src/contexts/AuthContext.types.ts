import { createContext } from 'react';
import type { UserInfo } from '../types/api';

export interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  logout: () => void | Promise<void>; // 서버 연결 시 Promise<void>로 변경
  signup: (name: string, studentId: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
