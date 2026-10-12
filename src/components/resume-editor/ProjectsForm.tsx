import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createEmptyProject, isProjectEmpty } from '../../lib/resumeContent';
import { cn } from '../../lib/utils';
import type { ProjectEntry, Repository } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { GithubPickerDialog } from './GithubPickerDialog';
import { SectionCard } from './SectionCard';

interface ProjectsFormProps {
  value: ProjectEntry[];
  onChange: (next: ProjectEntry[]) => void;
}

export function ProjectsForm({ value, onChange }: ProjectsFormProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const update = (id: string, patch: Partial<ProjectEntry>) =>
    onChange(value.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  const handleImport = (repos: Repository[]) => {
    const alreadyAdded = new Set(value.map((p) => p.repoId).filter(Boolean));
    const fresh: ProjectEntry[] = repos
      .filter((repo) => !alreadyAdded.has(repo.id))
      .map((repo) => ({
        id: crypto.randomUUID(),
        repoId: repo.id,
        name: repo.name,
        technologies: repo.tags.join(', '),
        contribution: '',
      }));
    if (fresh.length === 0) return;
    // Пустые заготовки заменяем импортированными проектами
    onChange([...value.filter((p) => !isProjectEmpty(p)), ...fresh]);
  };

  return (
    <>
      <SectionCard
        title="Проекты"
        description="Выберите проекты из профиля Github или добавьте свой. Укажите личный вклад для каждого."
      >
        <Button size="sm" className="self-start" onClick={() => setPickerOpen(true)}>
          Выбрать из Github
        </Button>

        {value.map((entry, index) => (
          <div key={entry.id} className={cn('flex flex-col gap-5', index > 0 && 'border-t border-line pt-5')}>
            {value.length > 1 && (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Проект {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((p) => p.id !== entry.id))}
                  aria-label={`Удалить проект ${index + 1}`}
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-600"
                >
                  <Trash2 aria-hidden className="size-4" /> Удалить
                </button>
              </div>
            )}
            <Input
              variant="outlined"
              label="Название"
              value={entry.name}
              onChange={(e) => update(entry.id, { name: e.target.value })}
            />
            <Input
              variant="outlined"
              label="Технологии"
              placeholder="Python, FastAPI, PostgreSQL"
              value={entry.technologies}
              onChange={(e) => update(entry.id, { technologies: e.target.value })}
            />
            <Textarea
              label="Ваш вклад"
              rows={4}
              value={entry.contribution}
              onChange={(e) => update(entry.id, { contribution: e.target.value })}
            />
          </div>
        ))}

        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => onChange([...value, createEmptyProject()])}
        >
          <Plus aria-hidden className="size-4" /> Добавить проект
        </Button>
      </SectionCard>

      <GithubPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleImport} />
    </>
  );
}