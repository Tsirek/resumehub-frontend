import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-medium text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-lg text-xs font-medium text-muted">{description}</p>}
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </section>
  );
}