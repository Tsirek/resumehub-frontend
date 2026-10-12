import { cn } from '../../lib/utils';
import { SECTIONS, type SectionId } from './sections';

interface SectionTabsProps {
  current: SectionId;
  onSelect: (id: SectionId) => void;
}

export function SectionTabs({ current, onSelect }: SectionTabsProps) {
  return (
    <nav aria-label="Разделы резюме">
      <ul className="flex flex-wrap gap-3">
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              aria-current={current === id ? 'step' : undefined}
              className={cn(
                'rounded-md border px-4 py-2 text-xs font-medium transition-colors',
                current === id
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line bg-white text-ink shadow-sm hover:border-primary/40',
              )}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}