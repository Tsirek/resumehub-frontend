import type { AcceptedImage, ImageVariant, ResumeImage, ResumeImageUrl } from '../types/images';
import { request } from './client';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (!file.size) return `«${file.name}»: файл пуст.`;
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) return `«${file.name}»: допустимы JPEG, PNG и WebP.`;
  if (file.size > MAX_IMAGE_BYTES) return `«${file.name}»: размер больше 5 МБ.`;
  return null;
}

export const listResumeImages = (resumeId: string, signal?: AbortSignal) =>
  request<ResumeImage[]>(`/resumes/${resumeId}/images`, { signal });

export function uploadResumeImage(
  resumeId: string,
  file: File,
  target: 'images' | 'avatar',
  signal?: AbortSignal,
): Promise<AcceptedImage> {
  const body = new FormData();
  body.append('file', file);
  return request<AcceptedImage>(`/resumes/${resumeId}/${target}`, { method: 'POST', body, signal });
}

export const deleteResumeImage = (resumeId: string, imageId: string, signal?: AbortSignal) =>
  request<void>(`/resumes/${resumeId}/images/${imageId}`, { method: 'DELETE', signal });

export const getResumeImageUrl = (resumeId: string, imageId: string, variant: ImageVariant, signal?: AbortSignal) =>
  request<ResumeImageUrl>(`/resumes/${resumeId}/images/${imageId}/url?variant=${variant}`, { signal });

export const setResumeAvatar = (resumeId: string, imageId: string | null, signal?: AbortSignal) =>
  request<AcceptedImage | undefined>(`/resumes/${resumeId}/avatar`, { method: 'PUT', body: JSON.stringify({ imageId }), signal });
