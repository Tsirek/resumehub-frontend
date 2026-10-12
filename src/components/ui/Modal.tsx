import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // React-овский autoFocus срабатывает до showModal, поэтому фокусируем вручную
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose} // срабатывает и по Esc, и после dialog.close()
      onClick={(e) => {
        // Клик по затемнению: target — сам <dialog>, т.к. весь контент внутри обёртки с padding
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-white p-0 text-ink shadow-xl backdrop:bg-navy/40"
    >
      {/* Контент рендерим только в открытом состоянии, чтобы формы сбрасывались при каждом открытии */}
      {open && (
        <div className="p-10">
          <div className="flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-2xl font-medium text-black">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="flex size-10 items-center justify-center rounded-lg border border-line bg-white text-ink hover:bg-field"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      )}
    </dialog>
  );
}