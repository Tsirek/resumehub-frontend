import { useEffect, useMemo, useState } from "react";
import { errorMessage } from "../../api/client";
import {
  createVacancy,
  deleteVacancy,
  getVacancies,
  getVacancyResumes,
  updateVacancy,
} from "../../api/vacancies";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { VacancyCard } from "../../components/vacancies/VacancyCard";
import { VacancyDialog } from "../../components/vacancies/VacancyDialog";
import { ResumeSnapshotDialog } from "../../components/vacancies/ResumeSnapshotDialog";
import { VACANCY_STATUS_OPTIONS } from "../../lib/vacancyStatus";
import type { Resume, Vacancy, VacancyInput, VacancyStatus } from "../../types";

type Filter = "all" | VacancyStatus;
type DialogState = { vacancy: Vacancy | null } | null;
const FILTER_OPTIONS = [
  { value: "all" as const, label: "Все" },
  ...VACANCY_STATUS_OPTIONS,
];

export function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      getVacancies(controller.signal),
      getVacancyResumes(controller.signal),
    ]).then(([vacancies, resumes]) => {
      if (controller.signal.aborted) return;
      if (vacancies.status === "fulfilled") {
        setVacancies(vacancies.value);
        setLoadError(null);
      } else setLoadError(errorMessage(vacancies.reason));
      if (resumes.status === "fulfilled") {
        setResumes(resumes.value);
        setResumeError(null);
      } else
        setResumeError(
          "Не удалось загрузить резюме. Создание вакансии без снимка доступно.",
        );
      setLoading(false);
    });
    return () => controller.abort();
  }, [reloadKey]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? vacancies
        : vacancies.filter((v) => v.status === filter),
    [vacancies, filter],
  );
  const markPending = (id: string, value: boolean) =>
    setPending((previous) => {
      const next = new Set(previous);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  const changeStatus = async (id: string, status: VacancyStatus) => {
    if (pending.has(id)) return;
    markPending(id, true);
    setError(null);
    try {
      const saved = await updateVacancy(id, { status });
      setVacancies((previous) =>
        previous.map((v) => (v.id === id ? saved : v)),
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      markPending(id, false);
    }
  };
  const remove = async (vacancy: Vacancy) => {
    if (
      pending.has(vacancy.id) ||
      !window.confirm(`Удалить вакансию «${vacancy.company}»?`)
    )
      return;
    markPending(vacancy.id, true);
    setError(null);
    try {
      await deleteVacancy(vacancy.id);
      setVacancies((previous) => previous.filter((v) => v.id !== vacancy.id));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      markPending(vacancy.id, false);
    }
  };
  const submit = async (input: VacancyInput) => {
    setError(null);
    if (dialog?.vacancy) {
      const saved = await updateVacancy(dialog.vacancy.id, input);
      setVacancies((previous) =>
        previous.map((v) => (v.id === saved.id ? saved : v)),
      );
    } else {
      const saved = await createVacancy(input);
      setVacancies((previous) => [saved, ...previous]);
      setFilter("all");
    }
    setDialog(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink">Вакансии и отклики</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Сохраняйте вакансии, отмечайте этапы отбора и планируйте следующие
        действия. Данные доступны только вам.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled={loading} onClick={() => setDialog({ vacancy: null })}>
          + Добавить вакансию
        </Button>
        <Button
          variant="secondary"
          disabled={pending.size > 0}
          loading={loading}
          onClick={() => {
            setLoading(true);
            setReloadKey((key) => key + 1);
          }}
        >
          Обновить
        </Button>
      </div>
      {(error || loadError) && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {error ?? loadError}
        </p>
      )}
      <section
        aria-label="Список вакансий"
        className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xl font-semibold" aria-live="polite">
            Показано: {visible.length} из {vacancies.length}
          </p>
          <Select
            label="Статус"
            value={filter}
            options={FILTER_OPTIONS}
            onChange={setFilter}
            className="w-44"
          />
        </div>
        {loading ? (
          <p className="mt-8 text-muted">Загрузка…</p>
        ) : loadError ? (
          <p className="mt-8 text-muted">
            Не удалось загрузить список. Нажмите «Обновить».
          </p>
        ) : !visible.length ? (
          <div className="mt-8">
            <p className="font-medium">
              {vacancies.length
                ? "Нет вакансий с выбранным статусом"
                : "Вы ещё не добавили вакансии"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {vacancies.length
                ? "Выберите другой фильтр или добавьте вакансию."
                : "Добавьте первую вакансию: компанию, должность, ссылку и следующий шаг."}
            </p>
          </div>
        ) : (
          <ul className="mt-3">
            {visible.map((vacancy) => (
              <VacancyCard
                key={vacancy.id}
                vacancy={vacancy}
                busy={pending.has(vacancy.id)}
                onStatusChange={(status) =>
                  void changeStatus(vacancy.id, status)
                }
                onEdit={() => setDialog({ vacancy })}
                onSnapshot={() => setSnapshotId(vacancy.id)}
                onDelete={() => void remove(vacancy)}
              />
            ))}
          </ul>
        )}
      </section>
      {dialog && (
        <VacancyDialog
          vacancy={dialog.vacancy}
          resumes={resumes}
          resumeError={resumeError}
          onClose={() => setDialog(null)}
          onSubmit={submit}
        />
      )}
      {snapshotId && (
        <ResumeSnapshotDialog
          vacancyId={snapshotId}
          onClose={() => setSnapshotId(null)}
        />
      )}
    </div>
  );
}
