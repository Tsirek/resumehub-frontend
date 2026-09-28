import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'outline' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface ButtonStyleOptions {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  outline: 'border-2 border-line bg-white text-primary hover:border-primary/40',
  secondary: 'border border-line bg-white text-ink shadow-sm hover:bg-field',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-md',
  md: 'h-11 px-5 text-base rounded-lg',
  lg: 'h-13 px-6 text-lg rounded-xl',
};

export const buttonClasses = ({ variant = 'primary', size = 'md', fullWidth }: ButtonStyleOptions = {}) =>
  cn(
    'inline-flex items-center justify-center gap-2 font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
  );

type ButtonProps = ComponentProps<'button'> & ButtonStyleOptions & { loading?: boolean };

export function Button({ variant, size, fullWidth, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? 'Подождите…' : children}
    </button>
  );
}