import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { createAnalysis, deleteAnalysis } from '../../api/analyses';
import { AnalysisActiveCard } from '../../components/analyses/AnalysisActiveCard';
import { AnalysisDetailsDialog } from '../../components/analyses/AnalysisDetailsDialog';
import { AnalysisFinishedRow } from '../../components/analyses/AnalysisFinishedRow';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { useAnalyses } from '../../hooks/useAnalyses';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getAnalysisTitle, isActiveAnalysis } from '../../lib/analysis';
import { cn, pluralize } from '../../lib/utils';
import { ROUTES } from '../../router/paths';
import type { GithubAnalysis } from '../../types';

type Tab = 'active' | 'done';

const TASKS_FORMS = { one: 'задача', few: 'задачи', many: 'задач' };

export default function BackgroundTasksPage() {
  usePageTitle('Фоновые задачи');

  const { items, loading, loadError, unavailableIds, addAnalysis, removeAnalysis, reload } = useAnalyses();

  const [tab, setTab] = useState<Tab | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GithubAnalysis | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const active = items.filter(isActiveAnalysis);
  const finished = items.filter((a) => !isActiveAnalysis(a)); 

  // По умолчанию открыта вкладка с активными задачами, а если их нет, то с готовыми
  const activeTab: Tab = tab ?? (active.length > 0 || finished.length === 0 ? 'active' : 'done');

  const details = items.find((a) => a.id === detailsId && a.status === 'COMPLETED') ?? null;

  // Ключ идемпотентности живёт, пока не получен ответ: повтор клика не создаст дубль задачи
  const retryKeys = useRef(new Map<string, string>());

  const handleRetry = async (analysis: GithubAnalysis) => {
    setRetryingId(analysis.id);
    setActionError(null);
    const key = retryKeys.current.get(analysis.id) ?? crypto.randomUUID();
    retryKeys.current.set(analysis.id, key);
    try {
      const created = await createAnalysis(analysis.repositories, key); 
      retryKeys.current.delete(analysis.id);
      addAnalysis(created);
      setTab('active');
    } catch {
      setActionError('Не удалось повторить анализ. Попробуйте ещё раз.');
    } finally {
      setRetryingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteAnalysis(deleteTarget.id); 
      removeAnalysis(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
      setActionError('Не удалось удалить задачу. Попробуйте ещё раз.');
    } finally {
      setDeleting(false);
    }
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'active', label: 'В процессе обработки', count: active.length },
    { id: 'done', label: 'Готово', count: finished.length },
  ];

  return (
    <>
      <PageHeader
        title="Фоновые задачи"
        subtitle="Отслеживайте статус обработки ваших задач с использованием ИИ."
      />

      {loading && <p className="text-muted">Загрузка…</p>}

      {loadError && (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-red-600">
            Не удалось загрузить задачи
          </p>
          <Button variant="secondary" size="sm" onClick={reload}>
            Повторить
          </Button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="flex flex-col gap-4">
          <div role="tablist" aria-label="Статус задач" className="flex flex-wrap gap-3">
            {tabs.map(({ id, label, count }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls="tasks-panel"
                onClick={() => setTab(id)}
                className={cn(
                  'rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                  activeTab === id
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line bg-white text-ink hover:border-primary/40',
                )}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {actionError && (
            <p role="alert" className="text-sm text-red-600">
              {actionError}
            </p>
          )}

          <section
            id="tasks-panel"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="rounded-2xl border border-line bg-white p-6"
          >
            {activeTab === 'active' ? (
              <>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-ink">В процессе обработки</h2>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {active.length} {pluralize(active.length, TASKS_FORMS)}
                  </span>
                </div>
                {active.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">
                    Активных задач нет. Выберите репозитории в разделе{' '}
                    <Link to={ROUTES.projects} className="text-primary underline">
                      Проекты
                    </Link>
                    , чтобы запустить анализ.
                  </p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-3">
                    {active.map((a) => (
                      <AnalysisActiveCard key={a.id} analysis={a} statusUnavailable={unavailableIds.has(a.id)} />
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-ink">Готово</h2>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {finished.length} {pluralize(finished.length, TASKS_FORMS)}
                  </span>
                </div>
                {finished.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">Завершённых задач пока нет.</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-2">
                    {finished.map((a) => (
                      <AnalysisFinishedRow
                        key={a.id}
                        analysis={a}
                        retrying={retryingId === a.id}
                        onOpen={(item) => setDetailsId(item.id)}
                        onRetry={handleRetry}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>
      )}

      <AnalysisDetailsDialog analysis={details} onClose={() => setDetailsId(null)} />

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        labelledBy="delete-task-title"
        className="max-w-md"
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4 p-6">
            <h2 id="delete-task-title" className="text-xl font-semibold">
              Удалить задачу?
            </h2>
            <p className="text-sm text-muted">
              «{getAnalysisTitle(deleteTarget.repositories)}» и её результат будут удалены без возможности
              восстановления.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Отмена
              </Button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Удаляем…' : 'Удалить'}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}