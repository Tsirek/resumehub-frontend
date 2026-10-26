import { useId, useState, type KeyboardEvent } from 'react';
import { Button } from '../ui/Button';
import { fieldClass } from '../ui/fieldStyles';

interface SkillsFormProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const inputId = useId();
  const hintId = useId();
  const [draft, setDraft] = useState('');

  const addSkill = () => {
    const value = draft.trim();
    if (!value) return;
    // Повторы не добавляются (без учёта регистра)
    const exists = skills.some((s) => s.toLowerCase() === value.toLowerCase());
    if (!exists) onChange([...skills, value]);
    setDraft('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm text-muted">
        Новый навык
      </label>
      <div className="flex flex-wrap gap-4">
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Например, Redis..."
          aria-describedby={hintId}
          className={`${fieldClass} min-w-0 flex-1`}
        />
        <Button type="button" onClick={addSkill}>
          + Добавить навык
        </Button>
      </div>

      {skills.length > 0 && (
        <ul aria-label="Добавленные навыки" className="mt-5 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill}
              className="flex items-center gap-2 rounded-lg border border-line bg-page px-3 py-1.5 text-sm text-ink"
            >
              {skill}
              <button
                type="button"
                onClick={() => onChange(skills.filter((s) => s !== skill))}
                aria-label={`Удалить навык ${skill}`}
                className="text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <p id={hintId} className="mt-5 text-xs text-muted">
        Добавление: кнопкой или Enter. Повторы не добавляются.
      </p>
    </div>
  );
}