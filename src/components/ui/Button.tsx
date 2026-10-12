import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

import { buttonClasses, type ButtonStyleOptions } from './buttonStyles';

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