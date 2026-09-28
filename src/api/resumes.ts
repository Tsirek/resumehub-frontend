import type { Resume } from '../types';
import { mockDelay } from './client';

// Тестовое хранилище. Потом удалить.
const mockResumes: Resume[] = [];

// BACKEND: GET /resumes
export async function getResumes(): Promise<Resume[]> {
  // return request<Resume[]>('/resumes');
  await mockDelay();
  return [...mockResumes];
}

// BACKEND: POST /resumes — создание резюме из пустого шаблона
export async function createResume(): Promise<Resume> {
  // return request<Resume>('/resumes', { method: 'POST', body: JSON.stringify({ template: 'blank' }) });
  await mockDelay();
  const resume: Resume = {
    id: crypto.randomUUID(),
    title: `Новое резюме ${mockResumes.length + 1}`,
    updatedAt: new Date().toISOString(),
  };
  mockResumes.push(resume);
  return resume;
}