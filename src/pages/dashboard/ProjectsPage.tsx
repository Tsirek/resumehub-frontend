import { useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { fetchRepositories, importRepositories } from '../../api/github';
import { PageHeader } from '../../components/layout/PageHeader';
import { RepositoryItem } from '../../components/projects/RepositoryItem';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn, parseGithubUsername, pluralize } from '../../lib/utils';
import type { Repository } from '../../types';

interface ImportMessage {
  type: 'success' | 'error';
  text: string;
}

export default function ProjectsPage() {
  const [profileUrl, setProfileUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [repos, setRepos] = useState<Repository[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<ImportMessage | null>(null);

  // Поиск по названию, описанию и технологиям
  const filtered = useMemo(() => {
    if (!repos) return [];
    const q = query.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter((r) => [r.name, r.description, ...r.tags].some((s) => s.toLowerCase().includes(q)));
  }, [repos, query]);

  const handleShowRepos = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const username = parseGithubUsername(profileUrl);
    if (!username) {
      setUrlError('Вставьте ссылку на профиль, а не на репозиторий: https://github.com/username');
      return;
    }

    setUrlError(null);
    setImportMessage(null);
    setLoading(true);
    try {
      const list = await fetchRepositories(username); // BACKEND: GET /github/repos?username=...
      setRepos(list);
      setSelected(new Set());
      setQuery('');
    } catch {
      setUrlError('Не удалось загрузить репозитории. Проверьте ссылку и попробуйте ещё раз.');
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

  // «Выбрать все» затрагивает только найденные по поиску репозитории
  const selectAll = () => setSelected((prev) => new Set([...prev, ...filtered.map((r) => r.id)]));
  const clearSelection = () => setSelected(new Set());

  const handleImport = async () => {
    setImporting(true);
    setImportMessage(null);
    try {
      await importRepositories([...selected]); // BACKEND: POST /projects/import
      setImportMessage({ type: 'success', text: `Проектов добавлено: ${selected.size}` });
    } catch {
      setImportMessage({ type: 'error', text: 'Не удалось импортировать проекты. Попробуйте ещё раз.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Один профиль. Нужные проекты"
        subtitle="Откройте список репозиториев и выберите, что включить в резюме."
      />

      <div className="flex flex-col gap-6">
        {/* Шаг 1: ссылка на профиль */}
        <section className="rounded-2xl border border-line bg-white p-8">
          <h2 className="text-2xl font-semibold text-ink">Подключить профиль Github</h2>

          <form onSubmit={handleShowRepos} noValidate className="mt-6">
            <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
              <Input
                variant="outlined"
                label="Ссылка на профиль, а не на отдельный репозиторий"
                type="url"
                inputMode="url"
                placeholder="https://github.com/username"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                aria-invalid={urlError ? true : undefined}
              />
              <Button type="submit" size="lg" loading={loading}>
                <ArrowRight aria-hidden className="size-4" /> Показать репозитории
              </Button>
            </div>
            {urlError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {urlError}
              </p>
            )}
          </form>
        </section>

        {/* Шаг 2: выбор репозиториев (появляется после загрузки списка) */}
        {repos && (
          <section className="rounded-2xl border border-line bg-white p-8">
            <h2 className="text-2xl font-semibold text-ink">Выберите проекты</h2>
            <p className="mt-2 text-sm text-muted">
              {repos.length}{' '}
              {pluralize(repos.length, {
                one: 'публичный репозиторий',
                few: 'публичных репозитория',
                many: 'публичных репозиториев',
              })}{' '}
              • Выбор можно изменить
            </p>

            {repos.length === 0 ? (
              <p className="mt-6 text-muted">У этого профиля нет публичных репозиториев.</p>
            ) : (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="min-w-48 flex-1">
                    <Input
                      variant="outlined"
                      type="search"
                      placeholder="Название или технология..."
                      aria-label="Поиск по репозиториям"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="secondary" size="sm" onClick={selectAll}>
                    Выбрать все
                  </Button>
                  <Button variant="secondary" size="sm" onClick={clearSelection}>
                    Снять выбор
                  </Button>
                </div>

                {filtered.length === 0 ? (
                  <p className="mt-6 text-muted">Ничего не найдено</p>
                ) : (
                  <ul className="mt-6 flex flex-col gap-4">
                    {filtered.map((repo) => (
                      <RepositoryItem
                        key={repo.id}
                        repo={repo}
                        selected={selected.has(repo.id)}
                        onToggle={toggle}
                      />
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                  <div>
                    <p className="font-semibold text-ink">Выбрано: {selected.size}</p>
                    <p className="text-xs text-muted">После импорта уточните личный вклад.</p>
                    <p
                      aria-live="polite"
                      className={cn(
                        'mt-1 text-sm',
                        importMessage?.type === 'error' ? 'text-red-600' : 'text-success',
                      )}
                    >
                      {importMessage?.text}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleImport}
                    loading={importing}
                    disabled={selected.size === 0}
                  >
                    <Plus aria-hidden className="size-4" /> Импортировать выбранные
                  </Button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </>
  );
}