import { Button } from '../ui/Button';
import { fieldClass } from '../ui/fieldStyles';
import { createEmptyEducation } from '../../lib/resumeFactories';
import type { EducationEntry } from '../../types';

interface EducationFormProps {
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
}

export function EducationForm({ entries, onChange }: EducationFormProps) {
  const patch = (id: string, changes: Partial<EducationEntry>) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, ...changes } : e)));

  return (
    <div>
      <Button type="button" size="sm" onClick={() => onChange([...entries, createEmptyEducation()])}>
        + Добавить запись
      </Button>

      <div className="mt-6 space-y-8">
        {entries.map((entry, index) => (
          <fieldset key={entry.id} className="space-y-5 border-t border-line pt-6 first:border-0 first:pt-0">
            <legend className="sr-only">Запись об образовании {index + 1}</legend>

            <div>
              <label htmlFor={`${entry.id}-institution`} className="mb-2 block text-sm text-muted">
                Учебное заведение
              </label>
              <input
                id={`${entry.id}-institution`}
                value={entry.institution}
                onChange={(e) => patch(entry.id, { institution: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor={`${entry.id}-specialty`} className="mb-2 block text-sm text-muted">
                Специальность / программа
              </label>
              <input
                id={`${entry.id}-specialty`}
                value={entry.specialty}
                onChange={(e) => patch(entry.id, { specialty: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor={`${entry.id}-period`} className="mb-2 block text-sm text-muted">
                Период
              </label>
              <input
                id={`${entry.id}-period`}
                value={entry.period}
                onChange={(e) => patch(entry.id, { period: e.target.value })}
                className={fieldClass}
              />
            </div>

            {entries.length > 1 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onChange(entries.filter((e) => e.id !== entry.id))}
              >
                Удалить запись
              </Button>
            )}
          </fieldset>
        ))}
      </div>
    </div>
  );
}