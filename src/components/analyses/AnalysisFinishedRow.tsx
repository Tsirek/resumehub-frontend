import { FileText } from 'lucide-react';
import { formatAnalysisDate, getAnalysisTitle, getStageText } from '../../lib/analysis';
import type { GithubAnalysis } from '../../types';
import { Button } from '../ui/Button';
import { StatusBadge } from './StatusBadge';

interface AnalysisFinishedRowProps {
  analysis: GithubAnalysis;
  retrying: boolean;
  onOpen: (analysis: GithubAnalysis) => void;
  onRetry: (analysis: GithubAnalysis) => void;
  onDelete: (analysis: GithubAnalysis) => void;
}

export function AnalysisFinishedRow({
  analysis,
  retrying,
  onOpen,
  onRetry,
  onDelete,
}: AnalysisFinishedRowProps) {
  const failed = analysis.status === 'FAILED';

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-line bg-white px-4 py-3">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"
      >
        <FileText className="size-5" />
      </span>

      <div className="min-w-48 flex-1">
        <p className="text-sm font-semibold text-ink">{getAnalysisTitle(analysis.repositories)}</p>
        <p className="text-xs text-muted">{getStageText(analysis)}</p>
      </div>

      <StatusBadge status={analysis.status} />

      <span className="w-32 text-xs text-muted">{formatAnalysisDate(analysis.updatedAt)}</span>

      <div className="flex gap-2">
        {failed ? (
          analysis.error?.retryable && (
            <Button variant="secondary" size="sm" loading={retrying} onClick={() => onRetry(analysis)}>
              Повторить
            </Button>
          )
        ) : (
          <Button variant="secondary" size="sm" onClick={() => onOpen(analysis)}>
            Открыть
          </Button>
        )}
        <button
          type="button"
          onClick={() => onDelete(analysis)}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Удалить
        </button>
      </div>
    </li>
  );
}