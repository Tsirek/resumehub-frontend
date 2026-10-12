import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { fetchRepositories, getProjects } from '../../api/github';
import type { Repository } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface GithubPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (repos: Repository[]) => void;
}

export function GithubPickerDialog({ open, onClose, onSelect }: GithubPickerDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // BACKEND: имя пользователя Github лучше брать из профиля или GitHub OAuth, а не вводить вручную
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<Repository[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Нативный <dialog> сам ловит фокус и закрывается по Esc
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    if (open) getProjects().then((items) => { if (!cancelled) setRepos(items); }).catch(() => { if (!cancelled) setError('Не удалось загрузить импортированные проекты'); });
    return () => { cancelled = true; };
  }, [open]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setSelected(new Set());
    try {
      setRepos(await fetchRepositories(name)); // BACKEND: GET /github/repos (api/github.ts)
    } catch {
      setError('Не удалось загрузить репозитории');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleConfirm = () => {
    onSelect(repos?.filter((r) => selected.has(r.id)) ?? []);
    setSelected(new Set());
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Клик по затемнению
        if (e.target === e.currentTarget) onClose();
      }}
      // m-auto нужен: Tailwind сбрасывает margin у dialog, и окно прилипает к углу
      className="m-auto w-full max-w-lg rounded-2xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40"
    >
      <div className="flex max-h-[85vh] flex-col gap-5 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold">
            Выбрать из Github
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-md p-1 text-muted hover:bg-field hover:text-ink"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              variant="outlined"
              label="Имя пользователя Github"
              placeholder="octocat"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <Button type="submit" loading={loading} className="h-12">
            Найти
          </Button>
        </form>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {repos?.length === 0 && <p className="text-sm text-muted">Публичных репозиториев не найдено</p>}

        {repos && repos.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Репозитории</legend>
            {repos.map((repo) => (
              <label
                key={repo.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 hover:bg-field"
              >
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0 accent-primary"
                  checked={selected.has(repo.id)}
                  onChange={() => toggle(repo.id)}
                />
                <span className="min-w-0">
                  <span className="block font-medium">{repo.name}</span>
                  <span className="block text-xs text-muted">{repo.description}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {repo.tags.map((tag) => (
                      <span key={tag} className="rounded bg-primary-soft px-2 py-0.5 text-[11px] text-navy">
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" disabled={selected.size === 0} onClick={handleConfirm}>
            Добавить выбранные ({selected.size})
          </Button>
        </div>
      </div>
    </dialog>
  );
}