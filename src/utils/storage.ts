const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'access_token';

export const storage = {
  // 토큰 저장
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // 토큰 조회
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // 토큰 삭제
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // 로컬 스토리지에 데이터 저장
  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  // 로컬 스토리지에서 데이터 조회
  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  },

  // 로컬 스토리지에서 데이터 삭제
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  // 모든 데이터 삭제
  clear: (): void => {
    localStorage.clear();
  },
};
