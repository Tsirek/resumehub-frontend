import { useId, type ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

type InputProps = ComponentProps<'input'> & {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  /** filled — формы входа/регистрации, outlined — профиль */
  variant?: 'filled' | 'outlined';
};

export function Input({ label, icon: Icon, error, variant = 'filled', className, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className={variant === 'filled' ? 'text-lg text-ink' : 'text-sm font-medium text-muted'}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted/60"
          />
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-lg border border-line text-ink outline-none transition',
            'placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20',
            variant === 'filled' ? 'h-9 bg-field text-sm' : 'h-12 bg-white font-medium shadow-sm',
            Icon ? 'pl-10 pr-3' : 'px-3',
            error && 'border-red-400',
            className,
          )}
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}