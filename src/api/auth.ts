import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types';
import { request } from './client';
import { session } from '../lib/session';
type Tokens = { access_token: string; refresh_token: string };
export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const tokens = await request<Tokens>('/login', { method: 'POST', body: JSON.stringify({ email: payload.email, password: payload.password }) }, false);
  const user = await request<User>('/users/me', { headers: { Authorization: `Bearer ${tokens.access_token}` } }, false);
  return { token: tokens.access_token, refreshToken: tokens.refresh_token, user: { ...user, id: String(user.id) } };
}
export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  await request<User>('/users', { method: 'POST', body: JSON.stringify(payload) }, false);
  return loginRequest({ ...payload, remember: true });
}
export async function logoutRequest(): Promise<void> {
  const refresh_token = session.getRefreshToken();
  if (refresh_token) await request<void>('/logout', { method: 'POST', body: JSON.stringify({ refresh_token }) }, false);
}
