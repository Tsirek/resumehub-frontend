import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
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

// Монтируйте компонент только когда диалог нужен: состояние формы сбрасывается при каждом открытии.
export function VacancyDialog({ vacancy, resumes, onClose, onSubmit }: VacancyDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();

  const [company, setCompany] = useState(vacancy?.company ?? '');
  const [position, setPosition] = useState(vacancy?.position ?? '');
  const [resumeId, setResumeId] = useState(vacancy?.resumeId ?? '');
  const [status, setStatus] = useState<VacancyStatus>(vacancy?.status ?? 'saved');
  const [nextStepDate, setNextStepDate] = useState(vacancy?.nextStepDate ?? '');
  const [description, setDescription] = useState(vacancy?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) {
      setError('Укажите компанию и должность.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        company: company.trim(),
        position: position.trim(),
        resumeId: resumeId || null,
        resumeTitle: resumes.find((r) => r.id === resumeId)?.title ?? null,
        nextStepDate: nextStepDate || null,
        status,
        description,
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
      className="m-auto w-full max-w-lg rounded-2xl p-0 backdrop:bg-ink/40"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-8">
        <h2 id={`${uid}-title`} className="text-xl font-semibold text-ink">
          {vacancy ? 'Изменить вакансию' : 'Добавить вакансию'}
        </h2>

        <div>
          <label htmlFor={`${uid}-company`} className="mb-2 block text-sm text-muted">Компания</label>
          <input id={`${uid}-company`} value={company} onChange={(e) => setCompany(e.target.value)} className={fieldClass} />
        </div>

        <div>
          <label htmlFor={`${uid}-position`} className="mb-2 block text-sm text-muted">Должность</label>
          <input id={`${uid}-position`} value={position} onChange={(e) => setPosition(e.target.value)} className={fieldClass} />
        </div>

        <Select
          label="Резюме"
          value={resumeId}
          options={[
            { value: '', label: 'Не выбрано' },
            ...resumes.map((r) => ({ value: r.id, label: r.title })),
          ]}
          onChange={setResumeId}
        />

        <Select label="Статус" value={status} options={VACANCY_STATUS_OPTIONS} onChange={setStatus} />

        <div>
          <label htmlFor={`${uid}-date`} className="mb-2 block text-sm text-muted">Дата следующего шага</label>
          <input id={`${uid}-date`} type="date" value={nextStepDate} onChange={(e) => setNextStepDate(e.target.value)} className={fieldClass} />
        </div>

        <div>
          <label htmlFor={`${uid}-text`} className="mb-2 block text-sm text-muted">Текст вакансии</label>
          <textarea id={`${uid}-text`} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={`${fieldClass} resize-y`} />
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Отмена</Button>
          <Button type="submit" size="sm" disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        </div>
      </form>
    </dialog>
  );
}