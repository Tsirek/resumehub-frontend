import type { Profile } from '../types';
import { mockDelay } from './client';

// Демо-данные из макета. Потом удалить.
let mockProfile: Profile = {
  fullName: 'Иван Иванов',
  specialization: 'Python Backend Developer',
  about:
    'Разрабатываю backend на Python и FastAPI. В проекте Roomly спроектировал REST API для бронирования переговорных, реализовал авторизацию и проверку пересечений по времени. Работаю с PostgreSQL и Docker. Хочу развиваться в команде, где смогу участвовать в проектировании и развитии сервисов.',
};

// BACKEND: GET /profile
export async function getProfile(): Promise<Profile> {
  // return request<Profile>('/profile');
  await mockDelay();
  return { ...mockProfile };
}

// BACKEND: PUT /profile
export async function updateProfile(profile: Profile): Promise<Profile> {
  // return request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(profile) });
  await mockDelay(300);
  mockProfile = { ...profile };
  return { ...mockProfile };
}

// BACKEND: POST /ai/improve-about — ИИ переписывает блок «О себе»
export async function improveAboutWithAI(about: string): Promise<string> {
  // const { text } = await request<{ text: string }>('/ai/improve-about', {
  //   method: 'POST',
  //   body: JSON.stringify({ text: about }),
  // });
  // return text;
  await mockDelay(1200);
  return `${about}\n\n[ИИ] Добавлены измеримые результаты: сократил время ответа API на 40%, покрыл сервис тестами на 85%.`;
}