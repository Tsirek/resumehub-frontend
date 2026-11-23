import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { VACANCY_STATUS_OPTIONS } from "../../lib/vacancyStatus";
import type { Vacancy, VacancyStatus } from "../../types";

interface VacancyCardProps {
  vacancy: Vacancy;
  busy: boolean;
  onStatusChange: (status: VacancyStatus) => void;
  onEdit: () => void;
  onSnapshot: () => void;
  onDelete: () => void;
}

export function VacancyCard({
  vacancy,
  busy,
  onStatusChange,
  onEdit,
  onSnapshot,
  onDelete,
}: VacancyCardProps) {
  return (
    <li
      className="flex flex-wrap items-start justify-between gap-6 border-b border-line py-7 last:border-b-0"
      aria-busy={busy}
    >
      <div className="min-w-0 flex-1">
        <h3 className="break-words text-lg font-semibold text-ink">
          {vacancy.company}
        </h3>
        <p className="mt-2 break-words text-sm font-medium">
          {vacancy.position}
        </p>
        {vacancy.url && (
          <a
            href={vacancy.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block break-all text-sm text-primary underline"
          >
            Открыть вакансию ↗
          </a>
        )}
        <p className="mt-2 text-xs text-muted">
          {vacancy.nextStepDate
            ? `Следующий шаг: ${new Date(`${vacancy.nextStepDate}T00:00:00`).toLocaleDateString("ru-RU")}`
            : "Дата следующего шага не задана"}
        </p>
        {vacancy.resumeTitle && (
          <p className="mt-2 text-xs text-muted">
            Снимок резюме: {vacancy.resumeTitle}
          </p>
        )}
        {vacancy.notes && (
          <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted">
            {vacancy.notes}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={onEdit}
          >
            Открыть / Изменить
          </Button>
          {vacancy.resumeTitle && (
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={onSnapshot}
            >
              Снимок резюме
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={onDelete}
            aria-label={`Удалить вакансию ${vacancy.company}`}
          >
            Удалить
          </Button>
        </div>
      </div>
      <Select
        label="Статус"
        value={vacancy.status}
        options={VACANCY_STATUS_OPTIONS}
        onChange={onStatusChange}
        disabled={busy}
        className="w-44"
      />
    </li>
  );
}
