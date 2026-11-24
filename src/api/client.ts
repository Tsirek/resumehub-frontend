import { session } from '../lib/session';

export const API_URL = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : undefined; } catch {
    throw new ApiError(response.status, 'Сервер вернул некорректный ответ. Проверьте соединение с API.');
  }
  if (!response.ok) {
    const message = data?.error?.message ?? (typeof data?.detail === 'string' ? data.detail : Array.isArray(data?.detail) ? data.detail.map((item: { msg: string }) => item.msg).join('; ') : `Ошибка сервера (${response.status})`);
    throw new ApiError(response.status, message);
  }
  return data as T;
}
let refreshing: Promise<void> | null = null;
async function refreshAccess(): Promise<void> {
  if (!refreshing) {
    const refreshToken = session.getRefreshToken();
    const rotate = async () => {
      if (!refreshToken) throw new ApiError(401, 'Войдите в аккаунт заново.');
      // Другая вкладка могла уже атомарно заменить refresh-токен.
      if (session.getRefreshToken() !== refreshToken) return;
      const response = await fetch(`${API_URL}/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }), signal: AbortSignal.timeout(20000) });
      const tokens = await parseResponse<{ access_token: string; refresh_token: string }>(response);
      if (session.getRefreshToken() !== refreshToken) throw new ApiError(401, 'Сессия изменилась.');
      session.updateTokens(tokens.access_token, tokens.refresh_token);
    };
    refreshing = (async () => {
      if (typeof navigator !== 'undefined' && navigator.locks) await navigator.locks.request('resumehub-refresh', rotate);
      else await rotate();
    })().catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401 && session.getRefreshToken() === refreshToken) {
        session.clear(); window.dispatchEvent(new Event('resumehub:session-expired'));
      }
      throw error;
    }).finally(() => { refreshing = null; });
  }
  return refreshing;
}
async function responseWithAuth(path: string, options: RequestInit, authenticated: boolean): Promise<Response> {
  const timeout = AbortSignal.timeout(120000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  const send = () => {
    const headers = new Headers(options.headers);
    if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
    if (authenticated && session.getToken() && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${session.getToken()}`);
    return fetch(`${API_URL}${path}`, { ...options, signal, headers });
  };
  const token = session.getToken();
  let response = await send();
  if (response.status === 401 && authenticated) {
    if (session.getToken() === token) await refreshAccess();
    response = await send();
  }
  return response;
}
export async function request<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  return parseResponse<T>(await responseWithAuth(path, options, authenticated));
}
export async function requestWithMeta<T>(path: string, options: RequestInit = {}): Promise<{ data: T; etag: string | null }> {
  const response = await responseWithAuth(path, options, true);
  return { data: await parseResponse<T>(response), etag: response.headers.get('ETag') };
}
export async function requestPdf(path: string): Promise<Blob> {
  const response = await responseWithAuth(path, {}, true);
  if (!response.ok) await parseResponse(response);
  if (!response.headers.get('Content-Type')?.includes('application/pdf')) throw new ApiError(502, 'Сервер не вернул PDF-файл.');
  return response.blob();
}
export const errorMessage = (error: unknown): string => {
  if (error instanceof DOMException && error.name === 'TimeoutError') return 'Сервер не ответил вовремя. Повторите запрос.';
  if (error instanceof TypeError) return 'Нет связи с сервером. Проверьте соединение и повторите запрос.';
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос.';
};

export const mockDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
