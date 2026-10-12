import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Элемент справа от заголовка, например кнопка */
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-10 flex items-center justify-between gap-6">
      <div>
        <h1 className="text-4xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-3 max-w-md text-sm font-medium text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}