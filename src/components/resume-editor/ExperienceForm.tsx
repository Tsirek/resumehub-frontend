import { Plus, Trash2 } from 'lucide-react';
import { createEmptyExperience } from '../../lib/resumeContent';
import { cn } from '../../lib/utils';
import type { ExperienceEntry } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { SectionCard } from './SectionCard';

interface ExperienceFormProps {
  value: ExperienceEntry[];
  onChange: (next: ExperienceEntry[]) => void;
}

export function ExperienceForm({ value, onChange }: ExperienceFormProps) {
  const update = (id: string, patch: Partial<ExperienceEntry>) =>
    onChange(value.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  return (
    <SectionCard title="Опыт">
      {value.map((entry, index) => (
        <div key={entry.id} className={cn('flex flex-col gap-5', index > 0 && 'border-t border-line pt-5')}>
          {value.length > 1 && (
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Место работы {index + 1}</h3>
              <button
                type="button"
                onClick={() => onChange(value.filter((e) => e.id !== entry.id))}
                aria-label={`Удалить место работы ${index + 1}`}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-600"
              >
                <Trash2 aria-hidden className="size-4" /> Удалить
              </button>
            </div>
          )}
          <Input
            variant="outlined"
            label="Компания / команда"
            value={entry.company}
            onChange={(e) => update(entry.id, { company: e.target.value })}
          />
          <Input
            variant="outlined"
            label="Должность"
            value={entry.role}
            onChange={(e) => update(entry.id, { role: e.target.value })}
          />
          <Input
            variant="outlined"
            label="Период"
            placeholder="Например, 2022 – настоящее время"
            value={entry.period}
            onChange={(e) => update(entry.id, { period: e.target.value })}
          />
          <Textarea
            label="Задачи и достижения"
            rows={4}
            value={entry.achievements}
            onChange={(e) => update(entry.id, { achievements: e.target.value })}
          />
        </div>
      ))}

      <Button
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, createEmptyExperience()])}
      >
        <Plus aria-hidden className="size-4" /> Добавить место работы
      </Button>
    </SectionCard>
  );
}