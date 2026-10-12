import type { User } from '../types';

const TOKEN_KEY = 'rh_token';
const REFRESH_KEY = 'rh_refresh';
const USER_KEY = 'rh_user';

// «Запомнить меня» → localStorage, иначе sessionStorage (сессия до закрытия вкладки).
// BACKEND: если бэкенд будет выдавать httpOnly-cookie, хранение токена здесь нужно убрать —
// это безопаснее, чем держать токен в JS-доступном хранилище (риск XSS).
const activeStorage = (): Storage | null => {
  if (localStorage.getItem(TOKEN_KEY)) return localStorage;
  if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
  return null;
};

export const session = {
  getRefreshToken: () => activeStorage()?.getItem(REFRESH_KEY) ?? null,
  updateTokens: (token: string, refreshToken: string) => {
    const storage = activeStorage();
    storage?.setItem(TOKEN_KEY, token);
    storage?.setItem(REFRESH_KEY, refreshToken);
  },
  getToken: () => activeStorage()?.getItem(TOKEN_KEY) ?? null,

  getUser: (): User | null => {
    const raw = activeStorage()?.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  save: (token: string, user: User, remember: boolean, refreshToken: string) => {
    session.clear();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(REFRESH_KEY, refreshToken);
    storage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
      storage.removeItem(REFRESH_KEY);
    }
    window.dispatchEvent(new Event('rh-session-cleared'));
  },
};