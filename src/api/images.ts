import type { ResumeImage, ResumeImageUrl } from '../types/images';
import { request } from './client';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return `«${file.name}»: допустимы JPEG, PNG и WebP.`;
  if (file.size > MAX_IMAGE_BYTES) return `«${file.name}»: размер больше 5 МБ.`;
  return null;
}

export const listResumeImages = (resumeId: string, signal?: AbortSignal) =>
  request<ResumeImage[]>(`/resumes/${resumeId}/images`, { signal });

/** Файл уходит на бэкенд как multipart/form-data; в S3 его кладёт сам бэкенд. */
export function uploadResumeImage(resumeId: string, file: File): Promise<ResumeImage> {
  const body = new FormData();
  body.append('file', file);
  return request<ResumeImage>(`/resumes/${resumeId}/images`, { method: 'POST', body });
}

export const deleteResumeImage = (resumeId: string, imageId: string) =>
  request<void>(`/resumes/${resumeId}/images/${imageId}`, { method: 'DELETE' });

/** Бэкенд отдаёт временную подписанную ссылку на S3; картинка скачивается напрямую оттуда. */
export const getResumeImageUrl = (resumeId: string, imageId: string, signal?: AbortSignal) =>
  request<ResumeImageUrl>(`/resumes/${resumeId}/images/${imageId}/url`, { signal });

export const setResumeAvatar = (resumeId: string, imageId: string | null) =>
  request<void>(`/resumes/${resumeId}/avatar`, { method: 'PUT', body: JSON.stringify({ imageId }) });
