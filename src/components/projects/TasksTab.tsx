import { useEffect, useState } from "react";
import { errorMessage } from "../../api/client";
import {
  getReportJob,
  isActiveJob,
  jobStatusText,
  listReportJobs,
  type ReportJob,
} from "../../api/reports";
import type { ProjectsTab } from "../../router/paths";
import { Button } from "../ui/Button";

interface TasksTabProps {
  onOpenTab: (tab: ProjectsTab) => void;
}

export function TasksTab({ onOpenTab }: TasksTabProps) {
  const [items, setItems] = useState<ReportJob[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreLoading, setMoreLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // BACKEND: GET /api/v1/github/report-jobs?limit=20 (курсорная пагинация)
    listReportJobs(undefined, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setItems(page.items);
        setCursor(page.next_cursor);
        setError(null);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  // Отслеживаем статусы всех загруженных задач, включая задачи на старых страницах.
  const activeIds = items
    .filter(isActiveJob)
    .map((job) => job.id)
    .sort()
    .join(",");
  useEffect(() => {
    if (!activeIds) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let delay = 4000;
    const tick = async () => {
      // BACKEND: GET /api/v1/github/report-jobs/{id}. Опрос каждые ~4 с, при ошибке интервал растёт до 30 с
      const results = await Promise.allSettled(
        activeIds.split(",").map(getReportJob),
      );
      if (cancelled) return;
      const fresh = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      setItems((previous) =>
        previous.map((job) => fresh.find((item) => item.id === job.id) ?? job),
      );
      const failed = results.find((result) => result.status === "rejected");
      setError(
        failed
          ? "Не удалось обновить часть статусов. Повторяем запрос автоматически."
          : null,
      );
      delay = failed ? Math.min(delay * 2, 30000) : 4000;
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeIds]);

  useEffect(() => {
    const visible = () => {
      if (document.visibilityState === "visible")
        setReloadKey((key) => key + 1);
    };
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, []);

  const more = async () => {
    if (!cursor) return;
    setMoreLoading(true);
    try {
      const page = await listReportJobs(cursor);
      setItems((previous) => [
        ...new Map(
          [...previous, ...page.items].map((job) => [job.id, job]),
        ).values(),
      ]);
      setCursor(page.next_cursor);
      setError(null);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setMoreLoading(false);
    }
  };

  return (
    <>
      <p className="mb-5 text-sm text-muted">
        Попытки обновления общего отчёта. Задачи не создают архив отдельных
        отчётов.
      </p>
      {error && (
        <div role="alert" className="mb-5">
          <p className="mb-3 text-red-600">{error}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setLoading(true);
              setReloadKey((key) => key + 1);
            }}
          >
            Обновить
          </Button>
        </div>
      )}
      {loading ? (
        <p>Загрузка задач…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {!items.length && !error && (
            <section className="rounded-2xl border border-line bg-white p-8">
              <h2 className="text-xl font-semibold">Задач пока нет</h2>
              <button
                type="button"
                className="mt-4 inline-block cursor-pointer text-primary underline"
                onClick={() => onOpenTab("repositories")}
              >
                Выбрать репозитории
              </button>
            </section>
          )}
          {items.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Анализ репозиториев</h2>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(job.created_at).toLocaleString("ru-RU")} ·
                    Проектов: {job.repo_ids.length}
                  </p>
                </div>
                <span className="rounded-md bg-primary-soft px-3 py-1 text-sm text-primary">
                  {jobStatusText[job.status]}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.repo_ids.map((id) => {
                  const repo = job.repositories.find(
                    (item) => item.repo_id === id,
                  );
                  return (
                    <span
                      key={id}
                      className="rounded-md bg-field px-3 py-1 text-sm"
                    >
                      {repo?.name || id}
                      {repo?.source === "cache" ? " · кеш" : ""}
                    </span>
                  );
                })}
              </div>
              {isActiveJob(job) && (
                <p className="mt-5 text-sm text-muted" role="status">
                  Обработка идёт в фоне. Можно закрыть страницу.
                </p>
              )}
              {job.error && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {job.error}
                </p>
              )}
              {job.status === "superseded" && (
                <p className="mt-4 text-sm text-muted">
                  Выбор или данные проектов изменились. Этот ответ не заменит
                  текущий отчёт.
                </p>
              )}
              {job.status === "completed" && (
                <p className="mt-4 text-sm text-muted">
                  Генерация завершена. На вкладке «Мой отчёт» доступен последний
                  сохранённый результат.
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-5">
                <button
                  type="button"
                  onClick={() => onOpenTab("report")}
                  className="cursor-pointer text-sm font-medium text-primary underline"
                >
                  Мой общий отчёт
                </button>
                {!isActiveJob(job) && (
                  <button
                    type="button"
                    onClick={() => onOpenTab("repositories")}
                    className="cursor-pointer text-sm text-primary underline"
                  >
                    Изменить выбор и перегенерировать
                  </button>
                )}
              </div>
            </article>
          ))}
          {cursor && (
            <Button
              variant="secondary"
              loading={moreLoading}
              onClick={() => void more()}
            >
              Показать ещё
            </Button>
          )}
        </div>
      )}
    </>
  );
}