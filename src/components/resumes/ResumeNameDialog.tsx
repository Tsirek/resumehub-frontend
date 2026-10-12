import { useState, type FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

type Mode = 'create' | 'rename';

const COPY: Record<Mode, { title: string; submit: string }> = {
  create: { title: 'Создать резюме', submit: 'Создать' },
  rename: { title: 'Переименовать', submit: 'Сохранить' },
};

const MAX_LENGTH = 100;

interface ResumeNameDialogProps {
  open: boolean;
  mode: Mode;
  initialTitle?: string;
  /** Должна бросать ошибку, если сохранить не удалось: диалог покажет сообщение */
  onSubmit: (title: string) => Promise<void>;
  onClose: () => void;
}

export function ResumeNameDialog({ open, mode, initialTitle = '', onSubmit, onClose }: ResumeNameDialogProps) {
  return (
    <Modal open={open} title={COPY[mode].title} onClose={onClose}>
      <NameForm initialTitle={initialTitle} submitLabel={COPY[mode].submit} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
}

interface NameFormProps {
  initialTitle: string;
  submitLabel: string;
  onSubmit: (title: string) => Promise<void>;
  onCancel: () => void;
}

function NameForm({ initialTitle, submitLabel, onSubmit, onCancel }: NameFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Введите название');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit(trimmed);
    } catch {
      setError('Не удалось сохранить. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Input
        variant="outlined"
        label="Название"
        value={title}
        maxLength={MAX_LENGTH}
        error={error ?? undefined}
        onChange={(e) => setTitle(e.target.value)}
        data-autofocus
      />

      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="secondary" className="rounded-full!" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" loading={loading} className="rounded-full!">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}