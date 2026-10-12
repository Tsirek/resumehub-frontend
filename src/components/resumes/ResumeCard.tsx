import { Link } from 'react-router';
import { Copy, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { resumePath } from '../../router/paths';
import type { Resume, ResumeStatus } from '../../types';
import { Button } from '../ui/Button';
import { buttonClasses } from '../ui/buttonStyles';

// Статус «ready» в макете не показан, подпись выбрана мной
const STATUS_LABEL: Record<ResumeStatus, string> = {
  draft: 'Черновик',
  ready: 'Готово',
};

interface ResumeCardProps {
  resume: Resume;
  busy?: boolean;
  onRename: (resume: Resume) => void;
  onDuplicate: (resume: Resume) => void;
  onDelete: (resume: Resume) => void;
}

export function ResumeCard({ resume, busy, onRename, onDuplicate, onDelete }: ResumeCardProps) {
  return (
    <li className="rounded-2xl border border-line bg-white p-6">
      <span className="inline-block rounded-lg bg-primary-soft px-6 py-3 text-sm font-medium text-primary">
        {STATUS_LABEL[resume.status]}
      </span>

      <h2 className="mt-5 text-3xl font-bold text-ink">{resume.title}</h2>
      <p className="mt-2 text-sm text-muted">{resume.position ?? 'Должность не указана'}</p>
      <p className="mt-1 text-xs text-muted">
        Проектов: {resume.projectsCount} • Мест работы: {resume.workplacesCount}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to={resumePath(resume.id)}
          className={cn(buttonClasses({ size: 'sm' }), 'rounded-full!')}
          aria-label={`Открыть резюме «${resume.title}»`}
        >
          Открыть
        </Link>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full!"
          disabled={busy}
          onClick={() => onDuplicate(resume)}
          aria-label={`Копировать резюме «${resume.title}»`}
        >
          <Copy aria-hidden className="size-4" /> Копировать
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full!"
          disabled={busy}
          onClick={() => onRename(resume)}
          aria-label={`Переименовать резюме «${resume.title}»`}
        >
          Переименовать
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full!"
          disabled={busy}
          onClick={() => onDelete(resume)}
          aria-label={`Удалить резюме «${resume.title}»`}
        >
          <Trash2 aria-hidden className="size-4" /> Удалить
        </Button>
      </div>
    </li>
  );
}