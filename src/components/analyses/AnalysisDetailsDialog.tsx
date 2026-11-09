import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, FileText, X } from 'lucide-react';
import { applyAnalysisToResume } from '../../api/analyses';
import { formatAnalysisDate } from '../../lib/analysis';
import { ROUTES } from '../../router/paths';
import type { AnalysisResult, GithubAnalysis, RepositoryStats } from '../../types';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

interface AnalysisDetailsDialogProps {
  analysis: GithubAnalysis | null; 
  onClose: () => void;
}

const STAT_LABELS: { key: keyof RepositoryStats; label: string }[] = [
  { key: 'filesAnalyzed', label: 'Файлов изучено' },
  { key: 'languages', label: 'Языков найдено' },
  { key: 'dependencies', label: 'Зависимостей' },
  { key: 'modules', label: 'Основных модулей' },
];

/**
 * BACKEND: stats в result нет в черновом контракте. Для набора из нескольких репозиториев
 * сумма «языков» завышена, поэтому лучше отдавать готовые агрегированные stats в result.
 */
function sumStats(result: AnalysisResult): RepositoryStats | null {
  const all = result.repositorySummaries.flatMap((s) => (s.stats ? [s.stats] : []));
  if (all.length === 0) return null;
  return all.reduce<RepositoryStats>(
    (acc, s) => ({
      filesAnalyzed: acc.filesAnalyzed + s.filesAnalyzed,
      languages: acc.languages + s.languages,
      dependencies: acc.dependencies + s.dependencies,
      modules: acc.modules + s.modules,
    }),
    { filesAnalyzed: 0, languages: 0, dependencies: 0, modules: 0 },
  );
}

export function AnalysisDetailsDialog({ analysis, onClose }: AnalysisDetailsDialogProps) {
  const titleId = useId();
  const result = analysis?.result ?? null;

  return (
    <Dialog open={Boolean(analysis && result)} onClose={onClose} labelledBy={titleId} className="max-w-2xl">
      {analysis && result && (
        <DetailsContent analysis={analysis} result={result} titleId={titleId} onClose={onClose} />
      )}
    </Dialog>
  );
}

interface DetailsContentProps {
  analysis: GithubAnalysis;
  result: AnalysisResult;
  titleId: string;
  onClose: () => void;
}

function DetailsContent({ analysis, result, titleId, onClose }: DetailsContentProps) {
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = sumStats(result);
  const technologies = [
    ...new Set([...result.repositorySummaries.flatMap((s) => s.technologies), ...result.skills]),
  ];
  const multiple = analysis.repositories.length > 1;

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      await applyAnalysisToResume(analysis.id); 
      onClose();
      navigate(ROUTES.resumes);
    } catch {
      setError('Не удалось добавить данные в резюме. Попробуйте ещё раз.');
      setApplying(false);
    }
  };

  return (
    <div className="flex max-h-[90vh] flex-col">
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <h2 id={titleId} className="text-xl font-semibold">
            {multiple ? 'Описание анализа репозиториев' : 'Описание анализа репозитория'}
          </h2>
          <p className="mt-1 text-xs text-muted">Результат анализа проекта на GitHub с помощью ИИ</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="rounded-md bg-primary-soft p-1.5 text-primary hover:bg-primary-soft/70"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>

      <div className="mt-5 overflow-y-auto px-6 pb-6">
        <ul className="flex flex-col gap-3">
          {analysis.repositories.map((repo) => (
            <li key={repo.id} className="flex items-center gap-4">
              <span
                aria-hidden
                className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
              >
                <FileText className="size-7" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink">{repo.name}</p>
                {repo.url && (
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-xs text-muted hover:text-primary hover:underline"
                  >
                    {repo.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-xs">
          <Check aria-hidden className="size-3.5 text-success" />
          <span className="font-semibold text-success">Анализ завершён</span>
          <span className="text-muted">• {formatAnalysisDate(analysis.updatedAt)}</span>
        </p>

        <hr className="my-5 border-line" />

        <h3 className="font-semibold text-ink">Общая информация о проекте</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{result.summary}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-xl bg-primary-soft p-4">
              <dd className="order-2 text-2xl font-semibold text-primary">{stats ? stats[key] : '—'}</dd>
              <dt className="text-xs text-muted">{label}</dt>
            </div>
          ))}
        </dl>

        {technologies.length > 0 && (
          <>
            <h3 className="mt-6 font-semibold text-ink">Обнаруженные технологии</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <li key={tech} className="rounded-md bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {tech}
                </li>
              ))}
            </ul>
          </>
        )}

        {result.resumeBullets.length > 0 && (
          <>
            <h3 className="mt-6 font-semibold text-ink">Выявленные компетенции</h3>
            {/* Формулировки предлагает ML, пользователь проверяет их перед использованием */}
            <ul className="mt-3 flex flex-col gap-2">
              {result.resumeBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-ink">
                  <span
                    aria-hidden
                    className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary text-white"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
        <p className="max-w-xs text-[11px] text-muted">
          Данные анализа можно использовать для формирования технического профиля резюме.
        </p>
        <div className="flex flex-col items-end gap-1">
          <Button size="sm" loading={applying} onClick={handleApply}>
            Использовать в резюме
          </Button>
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}