import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { fieldClass } from '../ui/fieldStyles';
import { VACANCY_STATUS_OPTIONS } from '../../lib/vacancyStatus';
import type { Resume, Vacancy, VacancyInput, VacancyStatus } from '../../types';

interface VacancyDialogProps {
  vacancy: Vacancy | null; // null → создание
  resumes: Resume[];
  onClose: () => void;
  onSubmit: (input: VacancyInput) => Promise<void>;
}

/** «Текущее» резюме — то, что редактировалось последним. */
function pickCurrentResume(resumes: Resume[]): Resume | null {
  let best: Resume | null = null;
  let bestTime = -Infinity;
  for (const resume of resumes) {
    const parsed = Date.parse(resume.updatedAt);
    const time = Number.isNaN(parsed) ? 0 : parsed;
    if (time > bestTime) {
      best = resume;
      bestTime = time;
    }
  }
  return best;
}

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}

function Field({ label, htmlFor, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm text-muted">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
    </div>
  );
}

// Монтируйте компонент только когда диалог нужен: состояние формы сбрасывается при каждом открытии.
export function VacancyDialog({ vacancy, resumes, onClose, onSubmit }: VacancyDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();

  const currentResume = useMemo(() => pickCurrentResume(resumes), [resumes]);

  const [company, setCompany] = useState(vacancy?.company ?? '');
  const [position, setPosition] = useState(vacancy?.position ?? '');
  const [url, setUrl] = useState(vacancy?.url ?? '');
  const [description, setDescription] = useState(vacancy?.description ?? '');
  const [nextStepDate, setNextStepDate] = useState(vacancy?.nextStepDate ?? '');
  const [notes, setNotes] = useState(vacancy?.notes ?? '');
  const [status, setStatus] = useState<VacancyStatus>(vacancy?.status ?? 'saved');
  // При создании чекбокс включён по умолчанию (как на макете), при правке — по текущему состоянию вакансии
  const [attachSnapshot, setAttachSnapshot] = useState(
    vacancy ? vacancy.resumeId !== null : currentResume !== null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  const canAttach = currentResume !== null || vacancy?.resumeId != null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) {
      setError('Укажите компанию и должность.');
      return;
    }
    const trimmedUrl = url.trim();
    if (trimmedUrl && !isHttpUrl(trimmedUrl)) {
      setError('Ссылка должна начинаться с http:// или https://');
      return;
    }

    // Если снимок уже был прикреплён, оставляем его: он не должен подменяться текущим резюме
    let resumeId: string | null = null;
    let resumeTitle: string | null = null;
    if (attachSnapshot) {
      if (vacancy?.resumeId) {
        resumeId = vacancy.resumeId;
        resumeTitle = vacancy.resumeTitle;
      } else if (currentResume) {
        resumeId = currentResume.id;
        resumeTitle = currentResume.title;
      }
    }

    setSaving(true);
    setError(null);
    try {
      // BACKEND: POST /vacancies или PUT /vacancies/:id.
      // Снимок резюме сервер делает только если resumeId отличается от сохранённого ранее.
      await onSubmit({
        company: company.trim(),
        position: position.trim(),
        url: trimmedUrl,
        description,
        nextStepDate: nextStepDate || null,
        notes,
        status,
        resumeId,
        resumeTitle,
      });
    } catch {
      setError('Не удалось сохранить вакансию. Попробуйте ещё раз.');
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${uid}-title`}
      onClose={onClose}
      onClick={(e) => {
        // Клик по подложке закрывает диалог
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-full max-w-xl rounded-2xl p-0 backdrop:bg-ink/40"
    >
      <form onSubmit={handleSubmit} noValidate className="flex max-h-[90vh] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-8 py-5">
          <h2 id={`${uid}-title`} className="text-lg font-semibold text-ink">
            {vacancy ? 'Изменить вакансию' : 'Новая вакансия'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-md border border-line p-1.5 text-muted hover:bg-field hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-8 py-6">
          <Field label="Компания" htmlFor={`${uid}-company`} required>
            <input
              id={`${uid}-company`}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <Field label="Должность" htmlFor={`${uid}-position`} required>
            <input
              id={`${uid}-position`}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <Field label="Ссылка на вакансию" htmlFor={`${uid}-url`}>
            <input
              id={`${uid}-url`}
              type="url"
              inputMode="url"
              placeholder="https://"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <Field label="Описание вакансии" htmlFor={`${uid}-description`}>
            <textarea
              id={`${uid}-description`}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${fieldClass} resize-y`}
            />
          </Field>

          <Field label="Дата следующего действия" htmlFor={`${uid}-date`}>
            <input
              id={`${uid}-date`}
              type="date"
              value={nextStepDate}
              onChange={(e) => setNextStepDate(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <Field label="Заметки" htmlFor={`${uid}-notes`}>
            <textarea
              id={`${uid}-notes`}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${fieldClass} resize-y`}
            />
          </Field>

          <Select label="Статус" value={status} options={VACANCY_STATUS_OPTIONS} onChange={setStatus} />

          <div>
            <label
              htmlFor={`${uid}-snapshot`}
              className={`flex items-center gap-2 text-sm text-ink ${canAttach ? '' : 'opacity-50'}`}
            >
              <input
                id={`${uid}-snapshot`}
                type="checkbox"
                checked={attachSnapshot && canAttach}
                disabled={!canAttach}
                onChange={(e) => setAttachSnapshot(e.target.checked)}
                aria-describedby={`${uid}-snapshot-hint`}
                className="size-4 accent-primary"
              />
              Прикрепить снимок текущего резюме
            </label>
            <p id={`${uid}-snapshot-hint`} className="mt-1 text-xs text-muted">
              {canAttach
                ? 'Снимок не изменится при дальнейшей правке резюме.'
                : 'Чтобы прикрепить снимок, сначала создайте резюме.'}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-8 py-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </dialog>
  );
}