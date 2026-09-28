import type { AuthResponse, LoginPayload, RegisterPayload } from '../types';
import { mockDelay } from './client';

// BACKEND: POST /auth/login
export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  // return request<AuthResponse>('/auth/login', {
  //   method: 'POST',
  //   body: JSON.stringify({ email: payload.email, password: payload.password }),
  // });
  await mockDelay();
  return {
    token: 'mock-token',
    user: { id: '1', name: 'Иван Иванов', email: payload.email },
  };
}

// BACKEND: POST /auth/register
export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  // return request<AuthResponse>('/auth/register', {
  //   method: 'POST',
  //   body: JSON.stringify(payload),
  // });
  await mockDelay();
  return {
    token: 'mock-token',
    user: { id: '1', name: payload.name, email: payload.email },
  };
}

// BACKEND: POST /auth/logout (инвалидация токена/сессии на сервере)
export async function logoutRequest(): Promise<void> {
  // await request<void>('/auth/logout', { method: 'POST' });
  await mockDelay(200);
}