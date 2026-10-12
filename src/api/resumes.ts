import type { Resume, ResumeContent } from '../types';
import { createEmptyContent, isExperienceEmpty, isProjectEmpty } from '../lib/resumeContent';
import { mockDelay } from './client';

// Тестовое хранилище с демо-резюме из макета. Потом удалить.
let mockResumes: Resume[] = [
  {
    id: 'demo-1',
    title: 'Тест резюме',
    status: 'draft',
    position: null,
    projectsCount: 1,
    workplacesCount: 0,
    updatedAt: new Date().toISOString(),
  },
];

// BACKEND: GET /resumes
export async function getResumes(): Promise<Resume[]> {
  // return request<Resume[]>('/resumes');
  await mockDelay();
  return [...mockResumes];
}

// BACKEND: GET /resumes/:id
export async function getResume(id: string): Promise<Resume> {
  // return request<Resume>(`/resumes/${id}`);
  await mockDelay(300);
  const resume = mockResumes.find((r) => r.id === id);
  if (!resume) throw new Error('Resume not found');
  return { ...resume };
}

// BACKEND: POST /resumes — создание резюме с названием
export async function createResume(title: string): Promise<Resume> {
  // return request<Resume>('/resumes', { method: 'POST', body: JSON.stringify({ title }) });
  await mockDelay();
  const resume: Resume = {
    id: crypto.randomUUID(),
    title,
    status: 'draft',
    position: null,
    projectsCount: 0,
    workplacesCount: 0,
    updatedAt: new Date().toISOString(),
  };
  mockResumes = [resume, ...mockResumes];
  return { ...resume };
}

// BACKEND: PATCH /resumes/:id — переименование
export async function renameResume(id: string, title: string): Promise<Resume> {
  // return request<Resume>(`/resumes/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) });
  await mockDelay(300);
  const index = mockResumes.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Resume not found');
  const updated = { ...mockResumes[index], title, updatedAt: new Date().toISOString() };
  mockResumes = mockResumes.map((r) => (r.id === id ? updated : r));
  return { ...updated };
}

// BACKEND: POST /resumes/:id/duplicate — копия резюме (название копии лучше задавать на сервере)
export async function duplicateResume(id: string): Promise<Resume> {
  // return request<Resume>(`/resumes/${id}/duplicate`, { method: 'POST' });
  await mockDelay();
  const source = mockResumes.find((r) => r.id === id);
  if (!source) throw new Error('Resume not found');
  const copy: Resume = {
    ...source,
    id: crypto.randomUUID(),
    title: `${source.title} (копия)`,
    updatedAt: new Date().toISOString(),
  };
  mockResumes = [copy, ...mockResumes];
  return { ...copy };
}

// BACKEND: DELETE /resumes/:id
export async function deleteResume(id: string): Promise<void> {
  // await request<void>(`/resumes/${id}`, { method: 'DELETE' });
  await mockDelay(300);
  mockResumes = mockResumes.filter((r) => r.id !== id);
}

// Тестовое хранилище содержимого резюме. Потом удалить.
const mockContents: Record<string, ResumeContent> = {};

// BACKEND: GET /resumes/:id/content — разделы резюме
export async function getResumeContent(id: string): Promise<ResumeContent> {
  // return request<ResumeContent>(`/resumes/${id}/content`);
  await mockDelay(300);

  const stored = mockContents[id];
  if (stored) return structuredClone(stored);

  const resume = mockResumes.find((r) => r.id === id);
  if (!resume) throw new Error('Resume not found');

  // BACKEND: контакты лучше подставлять на сервере из профиля пользователя
  const content = createEmptyContent();
  content.contacts = {
    fullName: 'Иван Иванов',
    position: resume.position ?? '',
    email: 'ivan.ivan@gmail.com',
    location: 'Москва / удалённо',
  };
  if (resume.projectsCount > 0) {
    content.projects = [
      {
        id: crypto.randomUUID(),
        name: 'Новый проект',
        technologies: '',
        contribution: 'Добавьте описание личного проекта',
      },
    ];
  }
  return content;
}

// BACKEND: PUT /resumes/:id/content — автосохранение, вызывается через 800 мс после последней правки.
// Сервер должен сам пересчитывать position, projectsCount, workplacesCount и updatedAt.
export async function saveResumeContent(id: string, content: ResumeContent): Promise<void> {
  // await request<void>(`/resumes/${id}/content`, { method: 'PUT', body: JSON.stringify(content) });
  await mockDelay(300);
  mockContents[id] = structuredClone(content);

  // Имитация пересчёта на сервере, чтобы список резюме обновлялся
  mockResumes = mockResumes.map((r) =>
    r.id === id
      ? {
          ...r,
          position: content.contacts.position.trim() || null,
          projectsCount: content.projects.filter((p) => !isProjectEmpty(p)).length,
          workplacesCount: content.experience.filter((e) => !isExperienceEmpty(e)).length,
          updatedAt: new Date().toISOString(),
        }
      : r,
  );
}

// BACKEND: GET /resumes/:id/pdf — сервер отдаёт PDF-файл.
// request() из client.ts парсит JSON, поэтому для файла нужен отдельный fetch:
//   const res = await fetch(`${API_URL}/resumes/${id}/pdf`, {
//     headers: { Authorization: `Bearer ${session.getToken()}` },
//   });
//   const url = URL.createObjectURL(await res.blob());
//   const a = document.createElement('a');
//   a.href = url; a.download = 'resume.pdf'; a.click();
//   URL.revokeObjectURL(url);
export async function exportResumePdf(id: string): Promise<void> {
  void id;
  await mockDelay(800);
}