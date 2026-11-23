import type { Resume, ResumeContent } from '../types';
import { fromResumeWire, toResumeWire, type ResumeWireContent } from '../lib/resumeWire';
import { request, requestPdf, requestWithMeta } from './client';

export const getResumes = (signal?: AbortSignal) => request<Resume[]>('/resumes', { signal });
export const getResume = (id: string, signal?: AbortSignal) => request<Resume>(`/resumes/${id}`, { signal });
export const createResume = (title: string) => request<Resume>('/resumes', { method: 'POST', body: JSON.stringify({ title }) });
export const renameResume = (id: string, title: string) => request<Resume>(`/resumes/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) });
export const duplicateResume = (id: string) => request<Resume>(`/resumes/${id}/duplicate`, { method: 'POST' });
export const deleteResume = (id: string) => request<void>(`/resumes/${id}`, { method: 'DELETE' });
export async function loadResumeContent(id: string, signal?: AbortSignal): Promise<{ content: ResumeContent; etag: string | null }> {
  const result = await requestWithMeta<ResumeWireContent>(`/resumes/${id}/content`, { signal });
  return { content: fromResumeWire(result.data), etag: result.etag };
}
export const getResumeContent = async (id: string): Promise<ResumeContent> => (await loadResumeContent(id)).content;
export async function saveResumeContent(id: string, content: ResumeContent, etag?: string | null): Promise<string | null> {
  const response = await requestWithMeta<void>(`/resumes/${id}/content`, { method: 'PUT', body: JSON.stringify(toResumeWire(content)), headers: etag ? { 'If-Match': etag } : {} });
  return response.etag;
}
export async function exportResumePdf(id: string, title = 'Резюме'): Promise<void> {
  const blob = await requestPdf(`/resumes/${id}/pdf`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
