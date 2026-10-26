import type { Vacancy, VacancyInput } from '../types';
import { mockDelay } from './client';

// Демо-вакансии из макета. Потом удалить.
let mockVacancies: Vacancy[] = [
  {
    id: 'vac-1',
    company: 'Yandex Junior',
    position: 'Python Backend Developer',
    resumeId: 'demo-1',
    resumeTitle: 'Python Backend',
    nextStepDate: null,
    status: 'interview',
    description:
      'Разрабатываем сервисы на Python и FastAPI. Нужен опыт работы с PostgreSQL, Docker и очередями задач. Kubernetes будет плюсом.',
  },
  {
    id: 'vac-2',
    company: 'MAI',
    position: 'Python Engineer',
    resumeId: null,
    resumeTitle: null,
    nextStepDate: null,
    status: 'sent',
    description: '',
  },
];

// BACKEND: GET /vacancies
export async function getVacancies(): Promise<Vacancy[]> {
  // return request<Vacancy[]>('/vacancies');
  await mockDelay();
  return [...mockVacancies];
}

// BACKEND: GET /vacancies/:id
export async function getVacancy(id: string): Promise<Vacancy> {
  // return request<Vacancy>(`/vacancies/${id}`);
  await mockDelay(300);
  const vacancy = mockVacancies.find((v) => v.id === id);
  if (!vacancy) throw new Error('Vacancy not found');
  return { ...vacancy };
}

// BACKEND: POST /vacancies
export async function createVacancy(input: VacancyInput): Promise<Vacancy> {
  // return request<Vacancy>('/vacancies', { method: 'POST', body: JSON.stringify(input) });
  await mockDelay();
  const vacancy: Vacancy = { id: crypto.randomUUID(), ...input };
  mockVacancies = [vacancy, ...mockVacancies];
  return { ...vacancy };
}

// BACKEND: PATCH /vacancies/:id — смена статуса, правка полей, сохранение текста вакансии
export async function updateVacancy(id: string, patch: Partial<VacancyInput>): Promise<Vacancy> {
  // return request<Vacancy>(`/vacancies/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  await mockDelay(300);
  const index = mockVacancies.findIndex((v) => v.id === id);
  if (index === -1) throw new Error('Vacancy not found');
  mockVacancies[index] = { ...mockVacancies[index], ...patch };
  return { ...mockVacancies[index] };
}

// BACKEND: DELETE /vacancies/:id
export async function deleteVacancy(id: string): Promise<void> {
  // await request<void>(`/vacancies/${id}`, { method: 'DELETE' });
  await mockDelay(300);
  mockVacancies = mockVacancies.filter((v) => v.id !== id);
}