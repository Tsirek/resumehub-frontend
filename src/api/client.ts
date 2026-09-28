import { session } from '../lib/session';

// BACKEND: базовый URL API задаётся в .env (VITE_API_URL)
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

/** Имитация сетевой задержки для заглушек. */
export const mockDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

/** Базовый запрос к API. Используется, когда заглушки будут заменены реальными вызовами. */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = session.getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    // BACKEND: согласовать формат ошибок и парсить сообщение из тела ответа
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}