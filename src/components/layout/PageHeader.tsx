export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-ink">{title}</h1>
      {subtitle && <p className="mt-3 max-w-md text-sm font-medium text-muted">{subtitle}</p>}
    </div>
  );
}