import type { Repository } from '../types';
import { mockDelay } from './client';

// Демо-репозитории из макета. Потом удалить.
const MOCK_REPOS: Repository[] = [
  {
    id: 'roomly-api',
    name: 'roomly-api',
    description: 'API бронирования переговорных, авторизация и проверка пересечений.',
    tags: ['Python', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: 'sales-explorer',
    name: 'sales-explorer',
    description: 'API бронирования переговорных, авторизация и проверка пересечений.',
    tags: ['Python', 'Pandas'],
  },
  {
    id: 'learning-notes',
    name: 'learning-notes',
    description: 'Конспекты по алгоритмам и базам данных.',
    tags: ['Markdown'],
  },
];

// BACKEND: GET /github/repos?username=... — публичные репозитории пользователя.
// Лучше ходить через свой бэкенд, а не напрямую в api.github.com из браузера:
// у анонимных запросов жёсткий лимит, а токен во фронтенде хранить нельзя.
export async function fetchRepositories(username: string): Promise<Repository[]> {
  // return request<Repository[]>(`/github/repos?username=${encodeURIComponent(username)}`);
  void username;
  await mockDelay(700);
  return MOCK_REPOS;
}

// BACKEND: POST /projects/import — добавить выбранные репозитории в проекты пользователя
export async function importRepositories(repoIds: string[]): Promise<void> {
  // await request<void>('/projects/import', { method: 'POST', body: JSON.stringify({ repoIds }) });
  void repoIds;
  await mockDelay(600);
}