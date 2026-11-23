import type { User } from "../types";

const TOKEN_KEY = "rh_token";
const REFRESH_KEY = "rh_refresh";
const USER_KEY = "rh_user";
const activeStorage = (): Storage | null => {
  if (localStorage.getItem(TOKEN_KEY)) return localStorage;
  if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
  return null;
};
export const session = {
  getToken: () => activeStorage()?.getItem(TOKEN_KEY) ?? null,
  getRefreshToken: () => activeStorage()?.getItem(REFRESH_KEY) ?? null,
  getUser: (): User | null => {
    const storage = activeStorage();
    if (storage?.getItem(TOKEN_KEY) === "mock-token") return null;
    const raw = storage?.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
  save: (
    token: string,
    user: User,
    remember: boolean,
    refreshToken: string,
  ) => {
    session.clear();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(REFRESH_KEY, refreshToken);
    storage.setItem(USER_KEY, JSON.stringify(user));
  },
  updateTokens: (token: string, refreshToken: string) => {
    const storage = activeStorage();
    storage?.setItem(TOKEN_KEY, token);
    storage?.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    for (const storage of [localStorage, sessionStorage]) {
      for (const key of [TOKEN_KEY, REFRESH_KEY, USER_KEY])
        storage.removeItem(key);
    }
  },
};
