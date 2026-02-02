const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? 'accessToken';
const USER_NAME_KEY = 'userName';

export const AUTH_CHANGED_EVENT = 'auth-changed';

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getUserName(): string | null {
  try {
    const v = localStorage.getItem(USER_NAME_KEY);
    return v && v.trim().length > 0 ? v.trim() : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  const token = getAccessToken();
  return Boolean(token && token.trim().length > 0);
}

export function setAuth(payload: {
  accessToken: string;
  userName?: string | null;
}) {
  try {
    localStorage.setItem(TOKEN_KEY, payload.accessToken);
    if (payload.userName && payload.userName.trim()) {
      localStorage.setItem(USER_NAME_KEY, payload.userName.trim());
    } else {
      localStorage.removeItem(USER_NAME_KEY);
    }
  } finally {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_NAME_KEY);
  } finally {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getDisplayUserName(): string {
  return getUserName() ?? 'USER';
}
