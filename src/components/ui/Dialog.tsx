import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, labelledBy, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // клик по затемнению
      }}
      className={cn(
        // m-auto нужен: Tailwind сбрасывает margin у dialog
        'm-auto w-full rounded-2xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40',
        className,
      )}
    >
      {open ? children : null}
    </dialog>
  );
}