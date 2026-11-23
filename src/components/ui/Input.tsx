import { useId, useState, type ComponentProps } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

type InputProps = ComponentProps<'input'> & {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  variant?: 'filled' | 'outlined';
};

export function Input({
  label,
  icon: Icon,
  error,
  variant = 'filled',
  className,
  id,
  type,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  const isPassword = type === 'password';
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType = isPassword && passwordVisible ? 'text' : type;

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
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-lg border border-line text-ink outline-none transition',
            'placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20',
            variant === 'filled' ? 'h-9 bg-field text-sm' : 'h-12 bg-white font-medium shadow-sm',
            Icon ? 'pl-10' : 'pl-3',
            // справа оставляем место под глазик
            isPassword ? 'pr-10 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden' : 'pr-3',
            error && 'border-red-400',
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
            aria-pressed={passwordVisible}
            title={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
            className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted/70 transition-colors hover:bg-line/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden className="size-4" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}