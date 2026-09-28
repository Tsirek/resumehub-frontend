import { useId, type ComponentProps } from 'react';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & { label: string };

export function Checkbox({ label, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const checkboxId = id ?? autoId;

  return (
    <label htmlFor={checkboxId} className="inline-flex cursor-pointer items-center gap-3 text-sm text-muted">
      <input
        id={checkboxId}
        type="checkbox"
        className="size-5 cursor-pointer rounded border-line accent-primary"
        {...props}
      />
      {label}
    </label>
  );
}