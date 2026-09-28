import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Надпись над заголовком формы: «● ВАШ ПРОФИЛЬ ВАС ЖДЕТ» */
export function Eyebrow({ tone = 'primary', children }: { tone?: 'primary' | 'success'; children: ReactNode }) {
  const color = tone === 'success' ? 'text-success' : 'text-primary';
  const dot = tone === 'success' ? 'bg-success' : 'bg-primary';

  return (
    <p className={cn('flex items-center gap-2 text-sm font-semibold uppercase', color)}>
      <span aria-hidden className={cn('size-3 rounded-full', dot)} />
      {children}
    </p>
  );
}