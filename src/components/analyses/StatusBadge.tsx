import { cn } from '../../lib/utils';
import type { AnalysisStatus } from '../../types';

const BADGES: Record<AnalysisStatus, { label: string; className: string }> = {
  PENDING: { label: 'В очереди', className: 'bg-primary-soft text-primary' },
  ANALYZING: { label: 'В обработке', className: 'bg-primary-soft text-primary' },
  AGGREGATING: { label: 'В обработке', className: 'bg-primary-soft text-primary' },
  COMPLETED: { label: 'Готово', className: 'bg-success/10 text-success' },
  FAILED: { label: 'Ошибка', className: 'bg-red-50 text-red-600' },
};

export function StatusBadge({ status }: { status: AnalysisStatus }) {
  const { label, className } = BADGES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}