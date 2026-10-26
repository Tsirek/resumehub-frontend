import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { VACANCY_STATUS_OPTIONS } from '../../lib/vacancyStatus';
import type { Vacancy, VacancyStatus } from '../../types';

interface VacancyCardProps {
  vacancy: Vacancy;
  onStatusChange: (status: VacancyStatus) => void;
  onEdit: () => void;
  onAdapt: () => void;
  onDelete: () => void;
}

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('ru-RU');
}

export function VacancyCard({ vacancy, onStatusChange, onEdit, onAdapt, onDelete }: VacancyCardProps) {
  // Подпись: дата шага, иначе резюме, иначе подсказка
  const subline = vacancy.nextStepDate
    ? `Следующий шаг: ${formatDate(vacancy.nextStepDate)}`
    : vacancy.resumeTitle
      ? `Резюме: ${vacancy.resumeTitle}`
      : 'Дата следующего шага не задана';

  return (
    <li className="flex flex-wrap items-start justify-between gap-6 border-b border-line py-8 last:border-b-0">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-ink">{vacancy.company}</h3>
        <p className="mt-2 text-sm font-semibold text-ink">{vacancy.position}</p>
        <p className="mt-2 text-xs text-muted">{subline}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
            Открыть / Изменить
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onAdapt}>
            ☆ Адаптировать
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
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
        className="w-44"
      />
    </li>
  );
}