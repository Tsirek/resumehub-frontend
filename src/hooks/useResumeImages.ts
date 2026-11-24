import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { errorMessage } from '../api/client';
import {
  deleteResumeImage,
  getResumeImageUrl,
  listResumeImages,
  setResumeAvatar,
  uploadResumeImage,
  validateImageFile,
} from '../api/images';
import type { ImageStatus, ResumeImage, ResumeImageUrl } from '../types/images';

const POLL_MS = 2500;
const URL_RETRY_MS = 15_000;
const URL_EXPIRY_BUFFER_MS = 5000;
type PreviewVariant = 'preview' | 'avatar';
type UrlKey = `${PreviewVariant}:${string}`;
const pending = (status: ImageStatus | null) => status === 'queued' || status === 'processing';

interface GalleryState {
  resumeId: string;
  images: ResumeImage[];
  error: string;
}

function useImageLinks(resumeId: string, images: ResumeImage[]) {
  const targets = images.flatMap((image) => {
    if (image.status !== 'ready') return [];
    return image.isAvatar ? [`preview:${image.id}`, `avatar:${image.id}`] : [`preview:${image.id}`];
  }).join(',');
  const cache = useRef(new Map<string, ResumeImageUrl>());
  const refresh = useRef<(key: UrlKey) => void>(() => {});
  const [links, setLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    const keys = new Set((targets ? targets.split(',') : []) as UrlKey[]);
    const running = new Set<UrlKey>();
    const retryAt = new Map<UrlKey, number>();
    const invalid = new Set<UrlKey>();
    const forcedAt = new Map<UrlKey, number>();
    const prefix = `${resumeId}/`;
    for (const key of cache.current.keys()) {
      if (!key.startsWith(prefix) || !keys.has(key.slice(prefix.length) as UrlKey)) {
        cache.current.delete(key);
      }
    }

    async function update(key: UrlKey) {
      if (!keys.has(key) || running.has(key) || Date.now() < (retryAt.get(key) ?? 0)) return;
      const [variant, imageId] = key.split(':') as [PreviewVariant, string];
      running.add(key);
      try {
        const link = await getResumeImageUrl(resumeId, imageId, variant, controller.signal);
        if (controller.signal.aborted) return;
        const cacheKey = prefix + key;
        cache.current.set(cacheKey, link);
        invalid.delete(key);
        setLinks((previous) => ({ ...previous, [cacheKey]: link.url }));
      } catch {
        if (!controller.signal.aborted) invalid.add(key);
      } finally {
        running.delete(key);
      }
    }

    const maintain = () => {
      for (const key of keys) {
        const link = cache.current.get(prefix + key);
        if (invalid.has(key) || !link || Date.parse(link.expiresAt) <= Date.now() + URL_EXPIRY_BUFFER_MS) {
          // Ограничиваем частоту повторов при недоступном хранилище.
          void update(key);
          if (running.has(key)) retryAt.set(key, Date.now() + URL_RETRY_MS);
        }
      }
    };
    refresh.current = (key) => {
      if (!keys.has(key)) return;
      invalid.add(key);
      if (!running.has(key) && Date.now() >= (forcedAt.get(key) ?? 0)) {
        forcedAt.set(key, Date.now() + URL_RETRY_MS);
        retryAt.delete(key);
        maintain();
      }
    };
    maintain();
    const timer = window.setInterval(maintain, URL_EXPIRY_BUFFER_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [resumeId, targets]);

  const avatarId = images.find((image) => image.isAvatar)?.id;
  const urls = Object.fromEntries(images.map(({ id }) => [id, links[`${resumeId}/preview:${id}`]]));
  const refreshUrl = useCallback((id: string) => refresh.current(`preview:${id}`), []);
  const refreshAvatar = useCallback(() => {
    if (avatarId) refresh.current(`avatar:${avatarId}`);
  }, [avatarId]);

  return { urls, avatarUrl: avatarId ? links[`${resumeId}/avatar:${avatarId}`] ?? null : null, refreshUrl, refreshAvatar };
}

export function useResumeImages(resumeId: string) {
  const [state, setState] = useState<GalleryState | null>(null);
  const [action, setAction] = useState<{ resumeId: string; busy: boolean; error: string } | null>(null);
  const [revision, reload] = useReducer((value: number) => value + 1, 0);
  const mutation = useRef<AbortController | null>(null);
  const current = state?.resumeId === resumeId ? state : null;
  const images = current?.images ?? [];
  const links = useImageLinks(resumeId, images);

  useEffect(() => () => {
    mutation.current?.abort();
    mutation.current = null;
  }, [resumeId]);

  useEffect(() => {
    if (!resumeId) return;
    const controller = new AbortController();
    let timer: number | undefined;

    async function refreshGallery() {
      try {
        const images = await listResumeImages(resumeId, controller.signal);
        if (controller.signal.aborted) return;
        setState({ resumeId, images, error: '' });
        if (!images.some((image) => pending(image.status) || pending(image.avatarStatus))) return;
      } catch (error) {
        if (controller.signal.aborted) return;
        setState((previous) => ({
          resumeId,
          images: previous?.resumeId === resumeId ? previous.images : [],
          error: errorMessage(error),
        }));
      }
      timer = window.setTimeout(() => { void refreshGallery(); }, POLL_MS);
    }

    void refreshGallery();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [resumeId, revision]);

  const runMutation = useCallback(async (action: (signal: AbortSignal) => Promise<void>) => {
    if (mutation.current) return;
    const controller = new AbortController();
    mutation.current = controller;
    setAction({ resumeId, busy: true, error: '' });
    try {
      await action(controller.signal);
    } catch (error) {
      if (!controller.signal.aborted) setAction({ resumeId, busy: true, error: errorMessage(error) });
    } finally {
      if (mutation.current === controller) {
        mutation.current = null;
        setAction((previous) => ({ resumeId, busy: false, error: previous?.error ?? '' }));
        reload();
      }
    }
  }, [resumeId]);

  const upload = (files: File[], target: 'images' | 'avatar' = 'images') =>
    runMutation(async (signal) => {
      const errors: string[] = [];
      for (const file of files) {
        if (signal.aborted) return;
        const problem = validateImageFile(file);
        if (problem) {
          errors.push(problem);
          continue;
        }
        try {
          await uploadResumeImage(resumeId, file, target, signal);
          reload();
        } catch (error) {
          errors.push(errorMessage(error));
        }
      }
      if (errors.length) throw new Error(errors.join(' '));
    });

  const selectAvatar = (imageId: string | null) => runMutation(async (signal) => {
    await setResumeAvatar(resumeId, imageId, signal);
  });

  const remove = (id: string) => runMutation(async (signal) => {
    await deleteResumeImage(resumeId, id, signal);
  });

  const currentAction = action?.resumeId === resumeId ? action : null;
  return {
    images, ...links, loading: !current, busy: currentAction?.busy ?? false,
    error: currentAction?.error || current?.error || '',
    upload, selectAvatar, remove,
  };
}
