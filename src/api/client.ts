import { session } from '../lib/session';
export const API_URL = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
let refreshing: Promise<void> | null = null;
async function error(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));
  const message = body.error?.message ?? (typeof body.detail === 'string' ? body.detail :
    Array.isArray(body.detail) ? body.detail.map((e: { msg: string }) => e.msg).join('; ') : `HTTP ${response.status}`);
  throw new ApiError(response.status, message);
}
export async function fetchApi(path: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  const token = session.getToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retry && session.getRefreshToken()) {
    if (!refreshing) {
      const refreshToken = session.getRefreshToken();
      refreshing = (async () => {
        const res = await fetch(`${API_URL}/refresh`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) { if (res.status === 401) session.clear(); await error(res); }
        const tokens = await res.json();
        // An old refresh response must not resurrect a logged-out/replaced session.
        if (session.getRefreshToken() !== refreshToken) throw new Error('Сессия изменена');
        session.updateTokens(tokens.access_token, tokens.refresh_token);
      })().finally(() => { refreshing = null; });
    }
    await refreshing;
    return fetchApi(path, options, false);
  }
  if (!response.ok) {
    if (response.status === 401 && token) session.clear();
    return error(response);
  }
  return response;
}
export async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetchApi(path, options, retry);
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
