import { useId, type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

type TextareaProps = ComponentProps<'textarea'> & { label?: string };

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full resize-y rounded-lg border border-line bg-white p-4 text-ink shadow-sm outline-none transition',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          className,
        )}
        {...props}
      />
    </div>
  );
}