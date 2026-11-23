import { useRef, type ChangeEvent } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES } from '../../api/images';
import { cn } from '../../lib/utils';
import type { ResumeImage } from '../../types/images';
import { Button } from '../ui/Button';
import { AvatarCircle } from './AvatarCircle';
import { SectionCard } from './SectionCard';

interface ImagesFormProps {
  name: string;
  images: ResumeImage[];
  urls: Record<string, string>;
  loading: boolean;
  busy: boolean;
  error: string;
  onUpload: (files: File[]) => void;
  onSelectAvatar: (imageId: string | null) => void;
  onRemove: (imageId: string) => void;
  onUrlExpired: (imageId: string) => void;
}

export function ImagesForm({
  name, images, urls, loading, busy, error, onUpload, onSelectAvatar, onRemove, onUrlExpired,
}: ImagesFormProps) {
  const input = useRef<HTMLInputElement>(null);
  const avatar = images.find((image) => image.isAvatar);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length) onUpload(files);
  };

  return (
    <SectionCard
      title="Изображения"
      description="Загрузите фото и выберите одно из них аватаром резюме. JPEG, PNG или WebP, до 5 МБ."
    >
      <div className="flex items-center gap-5">
        <AvatarCircle
          size="lg"
          name={name}
          alt="Аватар резюме"
          url={avatar ? urls[avatar.id] : null}
          onError={avatar ? () => onUrlExpired(avatar.id) : undefined}
        />
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm font-medium text-ink">Аватар резюме</p>
          <p className="text-xs text-muted">{avatar ? avatar.filename : 'Не выбран: в резюме будет без фото.'}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" loading={busy} onClick={() => input.current?.click()}>
              <Upload aria-hidden className="size-4" /> Загрузить
            </Button>
            {avatar && (
              <Button type="button" size="sm" variant="secondary" onClick={() => onSelectAvatar(null)}>
                Убрать аватар
              </Button>
            )}
          </div>
          <input
            ref={input}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-label="Выбор изображений"
            onChange={handleChange}
          />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-muted">Загрузка изображений…</p>}
      {!loading && images.length === 0 && <p className="text-sm text-muted">Изображений пока нет.</p>}

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
                {urls[image.id] ? (
                  <img
                    src={urls[image.id]}
                    alt={image.filename}
                    onError={() => onUrlExpired(image.id)}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-muted">Загрузка…</div>
                )}
              </div>
              <p className="truncate text-xs text-muted" title={image.filename}>{image.filename}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={image.isAvatar ? 'outline' : 'secondary'}
                  className="flex-1 px-2"
                  disabled={image.isAvatar}
                  onClick={() => onSelectAvatar(image.id)}
                >
                  {image.isAvatar ? 'Аватар' : 'В аватар'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="px-2"
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
