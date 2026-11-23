import { FileText } from "lucide-react";
import { isActiveJob, jobStatusText } from "../../api/reports";
import type { ProjectsTab } from "../../router/paths";
import type { Workspace } from "./projectsSection";

interface ReportTabProps {
  workspace: Workspace;
  error: string | null;
  onOpenTab: (tab: ProjectsTab) => void;
}

export function ReportTab({
  workspace: { report, library },
  error,
  onOpenTab,
}: ReportTabProps) {
  const active = isActiveJob(report.latest_job);
  return (
    <>
      {error && (
        <p role="alert" className="mb-4 text-red-600">
          Статус временно недоступен: {error}
        </p>
      )}
      {active && (
        <div role="status" className="mb-5 rounded-xl bg-primary-soft p-5">
          <p className="font-medium">Новый отчёт формируется</p>
          <p className="mt-1 text-sm">
            {jobStatusText[report.latest_job!.status]}.{" "}
            {report.report_text
              ? "Ниже доступен предыдущий отчёт."
              : "Результат появится после завершения."}{" "}
            <button
              type="button"
              className="cursor-pointer underline"
              onClick={() => onOpenTab("tasks")}
            >
              Открыть задачу
            </button>
          </p>
        </div>
      )}
      {!active &&
        report.latest_job &&
        ["failed", "timed_out"].includes(report.latest_job.status) && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-line bg-white p-5"
          >
            <p className="font-medium text-red-600">
              Обновить отчёт не удалось
            </p>
            <p className="mt-1 text-sm text-muted">
              {report.latest_job.error}{" "}
              {report.report_text ? "Предыдущий отчёт сохранён." : ""}
            </p>
          </div>
        )}
      {report.report_text ? (
        <article className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <FileText className="size-5 text-primary" />
            <span className="rounded-md bg-primary-soft px-3 py-1 text-sm text-primary">
              {report.is_current ? "Текущий отчёт" : "Предыдущий отчёт"}
            </span>
          </div>
          {report.summary_ru && (
            <p className="mt-5 whitespace-pre-wrap text-lg font-medium">
              {report.summary_ru}
            </p>
          )}
          <div className="mt-6 whitespace-pre-wrap break-words text-sm leading-relaxed">
            {report.report_text}
          </div>
          <div className="mt-7 border-t border-line pt-5">
            <p className="text-xs text-muted">Проекты в сохранённом отчёте</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {report.report_repo_ids.map((id) => {
                const repo = library.find((p) => p.id === id);
                return (
                  <span
                    key={id}
                    className="rounded-md bg-primary-soft px-3 py-1 text-sm"
                  >
                    {repo?.full_name ?? repo?.name ?? id}
                  </span>
                );
              })}
            </div>
          </div>
        </article>
      ) : (
        <section className="rounded-2xl border border-line bg-white p-8">
          <h2 className="text-xl font-semibold">Отчёт ещё не сформирован</h2>
          <p className="mt-3 text-muted">
            Выберите проекты и запустите генерацию. Результат всего набора
            появится здесь.
          </p>
        </section>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="cursor-pointer font-medium text-primary underline"
          onClick={() => onOpenTab("repositories")}
        >
          Изменить состав проектов
        </button>
        <span className="text-xs text-muted">
          Новая успешная генерация заменит сохранённый отчёт.
        </span>
      </div>
    </>
  );
}