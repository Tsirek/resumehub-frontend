import type { Resume, ResumeContent } from '../types';
import { request, fetchApi } from './client';
const path = (id: string) => `/resumes/${encodeURIComponent(id)}`;
export const getResumes = () => request<Resume[]>('/resumes');
export const getResume = (id: string) => request<Resume>(path(id));
export const createResume = (title: string) => request<Resume>('/resumes', { method: 'POST', body: JSON.stringify({ title }) });
export const renameResume = (id: string, title: string) => request<Resume>(path(id), { method: 'PATCH', body: JSON.stringify({ title }) });
export const duplicateResume = (id: string) => request<Resume>(`${path(id)}/duplicate`, { method: 'POST' });
export const deleteResume = (id: string) => request<void>(path(id), { method: 'DELETE' });
export const getResumeContent = (id: string) => request<ResumeContent>(`${path(id)}/content`);
// Serialize writes per resume so a slower old request cannot overwrite newer edits.
const saves = new Map<string, Promise<void>>();
export function saveResumeContent(id: string, content: ResumeContent): Promise<void> {
  const next = (saves.get(id) ?? Promise.resolve()).catch(() => {}).then(() =>
    request<void>(`${path(id)}/content`, { method: 'PUT', body: JSON.stringify(content), keepalive: true }));
  saves.set(id, next);
  void next.finally(() => { if (saves.get(id) === next) saves.delete(id); }).catch(() => {});
  return next;
}
export async function exportResumePdf(id: string): Promise<void> {
  await saves.get(id);
  const response = await fetchApi(`${path(id)}/pdf`);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url; link.download = 'resume.pdf'; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
