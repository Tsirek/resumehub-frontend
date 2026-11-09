import { useCallback, useEffect, useRef, useState } from 'react';
import { getAnalysis, listAnalyses } from '../api/analyses';
import { isActiveAnalysis } from '../lib/analysis';
import type { GithubAnalysis } from '../types';

const POLL_MS = 4000; 
const MAX_POLL_MS = 30_000;

export function useAnalyses() {
  const [items, setItems] = useState<GithubAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [unavailableIds, setUnavailableIds] = useState<ReadonlySet<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // BACKEND: GET /github/analyses (api/analyses.ts)
  useEffect(() => {
    let cancelled = false;
    listAnalyses()
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setLoadError(false);
      })
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    setReloadKey((k) => k + 1);
  }, []);

  // Опрос идёт, пока есть хотя бы одна активная задача
  const hasActive = items.some(isActiveAnalysis);

  useEffect(() => {
    if (!hasActive) return;

    let cancelled = false;
    let timer: number | undefined;
    let delay = POLL_MS;

    const tick = async () => {
      const ids = itemsRef.current.filter(isActiveAnalysis).map((a) => a.id);
      if (ids.length === 0) return;

      // BACKEND: GET /github/analyses/{id} для каждой активной задачи
      const results = await Promise.allSettled(ids.map((id) => getAnalysis(id)));
      if (cancelled) return;

      const fresh = new Map<string, GithubAnalysis>();
      const failed = new Set<string>();
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') fresh.set(ids[i], r.value);
        else failed.add(ids[i]);
      });

      setItems((prev) => prev.map((a) => fresh.get(a.id) ?? a));
      setUnavailableIds(failed);

      // При сетевой ошибке увеличиваем интервал, при успехе возвращаем обычный
      delay = failed.size > 0 ? Math.min(delay * 2, MAX_POLL_MS) : POLL_MS;
      timer = window.setTimeout(tick, delay);
    };

    // После возврата на вкладку обновляем данные сразу
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      window.clearTimeout(timer);
      void tick();
    };

    timer = window.setTimeout(tick, delay);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [hasActive]);

  const addAnalysis = useCallback(
    (analysis: GithubAnalysis) =>
      setItems((prev) => [analysis, ...prev.filter((a) => a.id !== analysis.id)]),
    [],
  );

  const removeAnalysis = useCallback(
    (id: string) => setItems((prev) => prev.filter((a) => a.id !== id)),
    [],
  );

  return { items, loading, loadError, unavailableIds, addAnalysis, removeAnalysis, reload };
}