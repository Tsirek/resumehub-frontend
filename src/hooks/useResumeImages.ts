import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/client';
import {
  deleteResumeImage,
  getResumeImageUrl,
  listResumeImages,
  setResumeAvatar,
  uploadResumeImage,
  validateImageFile,
} from '../api/images';
import type { ResumeImage } from '../types/images';

const URL_REFRESH_COOLDOWN_MS = 30_000;

export function useResumeImages(resumeId: string) {
  const [images, setImages] = useState<ResumeImage[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refreshedAt = useRef<Record<string, number>>({});

  const loadUrl = useCallback(async (imageId: string, signal?: AbortSignal) => {
    try {
      const { url } = await getResumeImageUrl(resumeId, imageId, signal);
      setUrls((prev) => ({ ...prev, [imageId]: url }));
    } catch { /* Без ссылки показываем заглушку, остальное продолжает работать. */ }
  }, [resumeId]);

  useEffect(() => {
    const controller = new AbortController();
    listResumeImages(resumeId, controller.signal)
      .then((list) => {
        setImages(list); setLoading(false);
        list.forEach((image) => void loadUrl(image.id, controller.signal));
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(errorMessage(e)); setLoading(false);
      });
    return () => controller.abort();
  }, [resumeId, loadUrl]);

  /** Подписанная ссылка живёт недолго: при ошибке загрузки запрашиваем новую, не чаще раза в 30 с. */
  const refreshUrl = useCallback((imageId: string) => {
    const now = Date.now();
    if (now - (refreshedAt.current[imageId] ?? 0) < URL_REFRESH_COOLDOWN_MS) return;
    refreshedAt.current[imageId] = now;
    void loadUrl(imageId);
  }, [loadUrl]);

  const upload = useCallback(async (files: File[]) => {
    setError(''); setBusy(true);
    for (const file of files) {
      const problem = validateImageFile(file);
      if (problem) { setError(problem); continue; }
      try {
        const image = await uploadResumeImage(resumeId, file);
        setImages((prev) => [...prev, image]);
        void loadUrl(image.id);
      } catch (e) { setError(errorMessage(e)); }
    }
    setBusy(false);
  }, [resumeId, loadUrl]);

  const selectAvatar = useCallback(async (imageId: string | null) => {
    setError('');
    const previous = images;
    setImages(previous.map((image) => ({ ...image, isAvatar: image.id === imageId })));
    try { await setResumeAvatar(resumeId, imageId); }
    catch (e) { setImages(previous); setError(errorMessage(e)); }
  }, [images, resumeId]);

  const remove = useCallback(async (imageId: string) => {
    setError('');
    try {
      await deleteResumeImage(resumeId, imageId);
      setImages((prev) => prev.filter((image) => image.id !== imageId));
      setUrls((prev) => { const next = { ...prev }; delete next[imageId]; return next; });
    } catch (e) { setError(errorMessage(e)); }
  }, [resumeId]);

  const avatar = images.find((image) => image.isAvatar);
  const avatarUrl = avatar ? urls[avatar.id] ?? null : null;
  const refreshAvatar = useCallback(() => { if (avatar) refreshUrl(avatar.id); }, [avatar, refreshUrl]);

  return { images, urls, loading, busy, error, upload, selectAvatar, remove, refreshUrl, avatarUrl, refreshAvatar };
}
