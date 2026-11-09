import { Clock, FileText } from 'lucide-react';
import {
  formatAnalysisDate,
  getAnalysisTitle,
  getProgressPercent,
  getStageText,
} from '../../lib/analysis';
import type { GithubAnalysis } from '../../types';
import { StatusBadge } from './StatusBadge';

interface AnalysisActiveCardProps {
  analysis: GithubAnalysis;
  statusUnavailable: boolean; 
}

export function AnalysisActiveCard({ analysis, statusUnavailable }: AnalysisActiveCardProps) {
  const title = getAnalysisTitle(analysis.repositories);
  const percent = getProgressPercent(analysis);

  return (
    <li className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"
        >
          <FileText className="size-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{getStageText(analysis)}</p>
          <div
            role="progressbar"
            aria-label={title}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-soft"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={analysis.status} />
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <Clock aria-hidden className="size-3.5" /> Запущено: {formatAnalysisDate(analysis.createdAt)}
          </span>
        </div>
      </div>

      {statusUnavailable && (
        <p role="status" className="mt-3 text-xs text-amber-600">
          Статус временно недоступен, повторяем запрос…
        </p>
      )}
    </li>
  );
}