import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, FolderGit2, RefreshCw } from "lucide-react";
import { errorMessage } from "../../api/client";
import { fetchRepositories } from "../../api/github";
import { generateReport, isActiveJob, saveLibrary } from "../../api/reports";
import { PageHeader } from "../../components/layout/PageHeader";
import { RepositoryItem } from "../../components/projects/RepositoryItem";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { useReportWorkspace } from "../../hooks/useReportWorkspace";
import { parseGithubUsername } from "../../lib/utils";
import { session } from "../../lib/session";
import { ROUTES } from "../../router/paths";
import type { Repository } from "../../types";

type Workspace = NonNullable<ReturnType<typeof useReportWorkspace>["data"]>;
type Candidate = Repository & { github_username?: string | null };

export default function ProjectsPage() {
  const { data, error, reload } = useReportWorkspace();
  if (!data)
    return (
      <div>
        {error ? (
          <>
            <p role="alert" className="text-red-600">
              {error}
            </p>
            <Button onClick={() => void reload()}>Повторить</Button>
          </>
        ) : (
          <p>Загрузка проектов…</p>
        )}
      </div>
    );
  return <ProjectsEditor workspace={data} refresh={reload} loadError={error} />;
}

function ProjectsEditor({
  workspace: { library, report },
  refresh,
  loadError,
}: {
  workspace: Workspace;
  refresh: () => Promise<void>;
  loadError: string | null;
}) {
  const navigate = useNavigate();
  const [profileUrl, setProfileUrl] = useState("");
  const [discovered, setDiscovered] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState(
    () => new Set(report.selected_repo_ids),
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestKey = useRef<{ signature: string; id: string } | null>(null);
  const repos = useMemo(
    () => [
      ...new Map(
        [...library, ...discovered].map((repo) => [repo.id, repo]),
      ).values(),
    ],
    [library, discovered],
  );
  const filtered = repos.filter((repo) =>
    [repo.name, repo.description, ...repo.tags]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const active = isActiveJob(report.latest_job);
  const changed =
    [...selected].sort().join() !== [...report.selected_repo_ids].sort().join();

  const discover = async (event: FormEvent) => {
    event.preventDefault();
    const username = parseGithubUsername(profileUrl);
    if (!username) {
      setError("Нужна ссылка на профиль: https://github.com/username");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await fetchRepositories(username);
      setDiscovered((previous) => [
        ...new Map(
          [
            ...previous,
            ...items.map((repo) => ({ ...repo, github_username: username })),
          ].map((repo) => [repo.id, repo]),
        ).values(),
      ]);
      if (!items.length)
        setError("У этого профиля нет публичных репозиториев.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const toggle = (id: string) => {
    if (generating || active) return;
    setError(null);
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else if (next.size < 20) next.add(id);
      return next;
    });
  };
  const generate = async () => {
    setGenerating(true);
    setError(null);
    const ids = [...selected].sort();
    const signature = JSON.stringify(ids);
    const storageKey = `rh_report_request:${session.getUser()?.id}`;
    // Повтор после потери ответа или перезагрузки страницы использует тот же request_id.
    if (requestKey.current?.signature !== signature) {
      let stored: { signature: string; id: string } | null = null;
      try {
        stored = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      } catch {
        /* Повреждённый черновик заменяется. */
      }
      requestKey.current =
        stored?.signature === signature
          ? stored
          : { signature, id: crypto.randomUUID() };
    }
    sessionStorage.setItem(storageKey, JSON.stringify(requestKey.current));
    try {
      const chosen = ids.map((id) => repos.find((repo) => repo.id === id));
      if (chosen.some((repo) => !repo?.github_username))
        throw new Error(
          "Найдите GitHub-профиль проекта, чтобы указать аккаунт для анализа.",
        );
      await saveLibrary(
        chosen.map((repo) => {
          const existing = library.find((project) => project.id === repo!.id);
          return {
            repo_id: repo!.id,
            github_username:
              existing?.github_username ?? repo!.github_username!,
            declared_role: existing?.declared_role ?? null,
            started_at: existing?.started_at ?? null,
            ended_at: existing?.ended_at ?? null,
          };
        }),
      );
      await generateReport(ids, requestKey.current!.id);
      sessionStorage.removeItem(storageKey);
      requestKey.current = null;
      setConfirm(false);
      await refresh();
      navigate(ROUTES.tasks);
    } catch (error) {
      setError(errorMessage(error));
      setConfirm(false);
      await refresh();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Какие проекты вас представляют?"
        subtitle="Выберите публичные репозитории для одного общего отчёта. Сохранённый анализ неизменившихся проектов используем повторно."
      />
      <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <FolderGit2 className="size-5" /> Добавить проекты из GitHub
        </h2>
        <form
          onSubmit={discover}
          className="mt-5 flex flex-wrap items-end gap-3"
        >
          <div className="min-w-48 flex-1">
            <Input
              variant="outlined"
              label="Ссылка на публичный профиль"
              placeholder="https://github.com/username"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
            />
          </div>
          <Button type="submit" loading={loading}>
            Показать репозитории
          </Button>
        </form>
        {(error || loadError) && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error ?? loadError}
          </p>
        )}
      </section>
      <section className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Репозитории</h2>
          <span className="text-sm text-muted">
            Выбрано {selected.size} из 20
          </span>
        </div>
        {active && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-primary-soft p-4 text-sm"
          >
            Отчёт формируется.{" "}
            <Link className="font-medium underline" to={ROUTES.tasks}>
              Посмотреть задачу
            </Link>
          </p>
        )}
        {repos.length ? (
          <>
            <div className="mt-5">
              <Input
                variant="outlined"
                type="search"
                aria-label="Поиск репозиториев"
                placeholder="Название или технология…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <fieldset disabled={generating || active} className="mt-5">
              <legend className="sr-only">Проекты для отчёта</legend>
              <ul className="flex flex-col gap-3">
                {filtered.map((repo) => (
                  <RepositoryItem
                    key={repo.id}
                    repo={repo}
                    selected={selected.has(repo.id)}
                    onToggle={toggle}
                    note={
                      (library.find((p) => p.id === repo.id)?.report_text
                        ? "Есть сохранённый анализ · перед запуском проверим SHA"
                        : "Ещё не анализировался") +
                      (!selected.has(repo.id) && selected.size === 20
                        ? " · достигнут лимит выбора"
                        : "")
                    }
                  />
                ))}
              </ul>
            </fieldset>
            {!filtered.length && (
              <p className="mt-4 text-muted">Ничего не найдено.</p>
            )}
          </>
        ) : (
          <p className="mt-5 text-muted">
            Добавьте GitHub-профиль, чтобы выбрать проекты.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t border-line pt-5">
          <div>
            <p className="font-medium">
              {changed
                ? "Состав следующего отчёта изменён"
                : "Выбрано проектов: " + selected.size}
            </p>
            <p className="mt-1 max-w-md text-xs text-muted">
              Снятие галочки исключает проект из следующего отчёта. Проект и его
              кеш остаются в библиотеке.
            </p>
          </div>
          <Button
            onClick={() => setConfirm(true)}
            disabled={!selected.size || active}
            loading={generating}
          >
            <RefreshCw className="size-4" />
            {report.report_text
              ? "Перегенерировать отчёт"
              : "Сформировать отчёт"}
          </Button>
        </div>
      </section>
      <Link
        to={ROUTES.report}
        className="mt-5 inline-flex items-center gap-2 text-primary"
      >
        Мой общий отчёт <ArrowRight className="size-4" />
      </Link>
      <Dialog
        open={confirm}
        onClose={() => {
          if (!generating) setConfirm(false);
        }}
        labelledBy="generate-report-title"
        className="max-w-lg"
      >
        <div className="p-6">
          <h2 id="generate-report-title" className="text-xl font-semibold">
            Сформировать новый отчёт?
          </h2>
          <p className="mt-3 text-sm text-muted">
            Выбрано проектов: {selected.size}. Для неизменившихся репозиториев
            используем сохранённые результаты.
          </p>
          <p className="mt-3 text-sm text-muted">
            Предыдущий отчёт останется доступен во время генерации. После
            успешного завершения его заменит новый.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button
              variant="secondary"
              disabled={generating}
              onClick={() => setConfirm(false)}
            >
              Отмена
            </Button>
            <Button loading={generating} onClick={() => void generate()}>
              Запустить генерацию
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
