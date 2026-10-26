import { Button } from '../ui/Button';
import { fieldClass } from '../ui/fieldStyles';
import { createEmptyAdditional } from '../../lib/resumeFactories';
import type { AdditionalEntry } from '../../types';

interface AdditionalFormProps {
  entries: AdditionalEntry[];
  onChange: (entries: AdditionalEntry[]) => void;
}

export function AdditionalForm({ entries, onChange }: AdditionalFormProps) {
  const patch = (id: string, changes: Partial<AdditionalEntry>) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, ...changes } : e)));

  return (
    <div>
      <Button type="button" size="sm" onClick={() => onChange([...entries, createEmptyAdditional()])}>
        + Добавить запись
      </Button>

      <div className="mt-6 space-y-8">
        {entries.map((entry, index) => (
          <fieldset key={entry.id} className="space-y-5 border-t border-line pt-6 first:border-0 first:pt-0">
            <legend className="sr-only">Дополнительная запись {index + 1}</legend>

            <div>
              <label htmlFor={`${entry.id}-title`} className="mb-2 block text-sm text-muted">
                Тип, язык, сертификат, публикация
              </label>
              <input
                id={`${entry.id}-title`}
                value={entry.title}
                onChange={(e) => patch(entry.id, { title: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor={`${entry.id}-description`} className="mb-2 block text-sm text-muted">
                Описание
              </label>
              <textarea
                id={`${entry.id}-description`}
                value={entry.description}
                onChange={(e) => patch(entry.id, { description: e.target.value })}
                rows={6}
                className={`${fieldClass} resize-y`}
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