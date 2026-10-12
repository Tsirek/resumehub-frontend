import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Repository } from '../../types';

interface RepositoryItemProps {
  repo: Repository;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function RepositoryItem({ repo, selected, onToggle }: RepositoryItemProps) {
  return (
    <li>
      <label
        className={cn(
          'flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors',
          selected ? 'border-primary/20 bg-primary-soft' : 'border-line bg-white hover:bg-field',
        )}
      >
        {/* Настоящий чекбокс скрыт визуально, но доступен с клавиатуры и для скринридеров */}
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(repo.id)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border border-ink/60 bg-white text-white',
            'peer-checked:border-primary peer-checked:bg-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2',
          )}
        >
          {selected && <Plus className="size-4" />}
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{repo.name}</span>
          <span className="mt-1 block text-xs text-muted">{repo.description}</span>
          <span className="mt-3 flex flex-wrap gap-2">
            {repo.tags.map((tag) => (
              <span key={tag} className="rounded bg-field px-2 py-1 text-[10px] text-muted">
                {tag}
              </span>
            ))}
          </span>
        </span>
      </label>
    </li>
  );
}