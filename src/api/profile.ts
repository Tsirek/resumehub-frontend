import type { Profile } from '../types';
import { request, ApiError } from './client';
import { session } from '../lib/session';
type ServerProfile = { full_name: string; specialization: string; about: string };
const convert = (p: ServerProfile): Profile => ({ fullName: p.full_name, specialization: p.specialization, about: p.about });
export async function getProfile(): Promise<Profile> {
  try { return convert(await request<ServerProfile>('/users/me/profile')); }
  catch (e) {
    if (e instanceof ApiError && e.status === 404) return { fullName: session.getUser()?.name ?? '', specialization: '', about: '' };
    throw e;
  }
}
export async function updateProfile(profile: Profile): Promise<Profile> {
  return convert(await request<ServerProfile>('/users/me/profile', { method: 'PUT', body: JSON.stringify({ full_name: profile.fullName, specialization: profile.specialization, about: profile.about }) }));
}
export async function improveAboutWithAI(about: string): Promise<string> {
  return (await request<{ text: string }>('/ai/improve-about', { method: 'POST', body: JSON.stringify({ text: about }) })).text;
}
