import { cn, getInitials } from '../../lib/utils';

interface AvatarCircleProps {
  url?: string | null;
  name?: string;
  size?: 'md' | 'lg';
  alt?: string;
  className?: string;
  onError?: () => void;
}

export function AvatarCircle({ url, name = '', size = 'md', alt = '', className, onError }: AvatarCircleProps) {
  const sizeClass = size === 'lg' ? 'size-28 text-3xl' : 'size-16 text-xl';
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        onError={onError}
        className={cn(sizeClass, 'shrink-0 rounded-full border border-line object-cover', className)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(sizeClass, 'flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-medium text-primary', className)}
    >
      {getInitials(name) || '•'}
    </div>
  );
}
