import { useRef, type ChangeEvent } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES } from '../../api/images';
import { cn } from '../../lib/utils';
import type { ImageStatus, ResumeImage } from '../../types/images';
import { Button } from '../ui/Button';
import { AvatarCircle } from './AvatarCircle';
import { SectionCard } from './SectionCard';

interface ImagesFormProps {
  name: string;
  images: ResumeImage[];
  urls: Record<string, string>;
  avatarUrl: string | null;
  loading: boolean;
  busy: boolean;
  error: string;
  onUpload: (files: File[]) => void;
  onUploadAvatar: (file: File) => void;
  onSelectAvatar: (imageId: string | null) => void;
  onRemove: (imageId: string) => void;
  onUrlExpired: (imageId: string) => void;
  onAvatarUrlExpired: () => void;
}

const statusText: Record<ImageStatus, string> = {
  queued: 'В очереди',
  processing: 'Обрабатывается…',
  failed: 'Ошибка обработки',
  ready: 'Загружаем превью…',
};

export function ImagesForm({
  name, images, urls, avatarUrl, loading, busy, error,
  onUpload, onUploadAvatar, onSelectAvatar, onRemove, onUrlExpired, onAvatarUrlExpired,
}: ImagesFormProps) {
  const galleryInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const avatar = images.find((image) => image.isAvatar);
  const pendingAvatar = images.find((image) => image.avatarStatus === 'queued' || image.avatarStatus === 'processing');

  const handleGallery = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (files.length) onUpload(files);
  };

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) onUploadAvatar(file);
  };

  return (
    <SectionCard
      title="Изображения"
      description="Загрузите аватарку или выберите фото из галереи. JPEG, PNG или WebP, до 5 МБ на файл."
    >
      <div className="flex items-center gap-5">
        <AvatarCircle size="lg" name={name} alt="Аватар резюме" url={avatarUrl} onError={onAvatarUrlExpired} />
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm font-medium text-ink">Аватар резюме</p>
          <p className="text-xs text-muted">{avatar?.filename ?? 'Аватарка пока не выбрана.'}</p>
          {pendingAvatar && <p role="status" className="text-xs text-muted">Готовим аватарку «{pendingAvatar.filename}»…</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={busy} onClick={() => avatarInput.current?.click()}>
              <Upload aria-hidden className="size-4" /> {avatar ? 'Заменить аватарку' : 'Загрузить аватарку'}
            </Button>
            {(avatar || pendingAvatar) && (
              <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => onSelectAvatar(null)}>
                {avatar ? 'Убрать аватарку' : 'Отменить выбор аватарки'}
              </Button>
            )}
          </div>
          <input
            ref={avatarInput}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            className="sr-only"
            tabIndex={-1}
            aria-label="Файл аватарки"
            onChange={handleAvatar}
          />
        </div>
      </div>

      <div>
        <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => galleryInput.current?.click()}>
          <Upload aria-hidden className="size-4" /> Добавить в галерею
        </Button>
        <input
          ref={galleryInput}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Файлы галереи"
          onChange={handleGallery}
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-muted">Загрузка изображений…</p>}
      {!loading && !error && images.length === 0 && <p className="text-sm text-muted">Изображений пока нет.</p>}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image) => (
            <li
              key={image.id}
              className={cn(
                'flex flex-col gap-2 rounded-xl border p-3',
                image.isAvatar ? 'border-primary bg-primary-soft/40' : 'border-line bg-white',
              )}
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-field">
                {image.status === 'ready' && urls[image.id] ? (
                  <img
                    src={urls[image.id]}
                    alt={image.filename}
                    onError={() => onUrlExpired(image.id)}
                    className="size-full object-cover"
                  />
                ) : (
                  <p role="status" className="flex size-full items-center justify-center px-2 text-center text-xs text-muted">
                    {statusText[image.status]}
                  </p>
                )}
              </div>
              <p className="truncate text-xs text-muted" title={image.filename}>{image.filename}</p>
              {(image.error || image.avatarError) && (
                <p role="alert" className="text-xs text-red-700">{image.error || image.avatarError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={image.isAvatar ? 'outline' : 'secondary'}
                  className="flex-1 px-2"
                  disabled={busy || image.isAvatar || image.status !== 'ready' || pendingAvatar?.id === image.id}
                  onClick={() => onSelectAvatar(image.id)}
                >
                  {image.isAvatar ? 'Аватар' : 'В аватар'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="px-2"
                  disabled={busy}
                  aria-label={`Удалить ${image.filename}`}
                  onClick={() => { if (window.confirm(`Удалить «${image.filename}»?`)) onRemove(image.id); }}
                >
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
