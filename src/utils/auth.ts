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

export function isLoggedIn(): boolean {
  const token = getAccessToken();
  return Boolean(token && token.trim().length > 0);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function setUserName(name: string | null | undefined) {
  if (!name || !name.trim()) {
    localStorage.removeItem(USER_NAME_KEY);
  } else {
    localStorage.setItem(USER_NAME_KEY, name.trim());
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getUserNameFromStorage(): string | null {
  try {
    const v = localStorage.getItem(USER_NAME_KEY);
    return v && v.trim().length > 0 ? v.trim() : null;
  } catch {
    return null;
  }
}

export function getNameFromJwt(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded =
      payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);

    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    const payload = JSON.parse(json) as Record<string, unknown>;

    const candidates = [
      payload.user_name,
      payload.userName,
      payload.name,
      payload.nickname,
      payload.username,
      payload.userId,
      payload.email,
    ];

    const picked = candidates.find(
      (v) => typeof v === 'string' && v.trim().length > 0,
    ) as string | undefined;

    if (!picked) return null;

    const normalized = picked.includes('@') ? picked.split('@')[0] : picked;

    return normalized.length > 12 ? `${normalized.slice(0, 12)}…` : normalized;
  } catch {
    return null;
  }
}

export function getDisplayUserName(): string {
  const fromStorage = getUserNameFromStorage();
  if (fromStorage) return fromStorage;

  const token = getAccessToken();
  if (!token) return 'USER';

  const fromJwt = getNameFromJwt(token);
  return fromJwt ?? 'USER';
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
