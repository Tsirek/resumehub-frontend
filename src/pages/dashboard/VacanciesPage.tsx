import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { VacancyCard } from '../../components/vacancies/VacancyCard';
import { VacancyDialog } from '../../components/vacancies/VacancyDialog';
import { getResumes } from '../../api/resumes';
import { createVacancy, deleteVacancy, getVacancies, updateVacancy } from '../../api/vacancies';
import { VACANCY_STATUS_OPTIONS } from '../../lib/vacancyStatus';
import type { Resume, Vacancy, VacancyInput, VacancyStatus } from '../../types';

type Filter = 'all' | VacancyStatus;
type DialogState = { vacancy: Vacancy | null } | null; // null → закрыт, vacancy: null → создание

const FILTER_OPTIONS = [{ value: 'all' as const, label: 'Все' }, ...VACANCY_STATUS_OPTIONS];

// Замените на константу из router/paths.ts
const ADAPTATION_PATH = '/app/adaptation';

export function VacanciesPage() {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);

  useEffect(() => {
    Promise.all([getVacancies(), getResumes()])
      .then(([v, r]) => {
        setVacancies(v);
        setResumes(r);
      })
      .catch(() => setError('Не удалось загрузить вакансии.'))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? vacancies : vacancies.filter((v) => v.status === filter)),
    [vacancies, filter],
  );

  const handleStatusChange = async (id: string, status: VacancyStatus) => {
    const previous = vacancies;
    setVacancies((list) => list.map((v) => (v.id === id ? { ...v, status } : v)));
    try {
      await updateVacancy(id, { status });
    } catch {
      setVacancies(previous);
      setError('Не удалось изменить статус.');
    }
  };

  const handleDelete = async (vacancy: Vacancy) => {
    if (!window.confirm(`Удалить вакансию «${vacancy.company}»?`)) return;
    try {
      await deleteVacancy(vacancy.id);
      setVacancies((list) => list.filter((v) => v.id !== vacancy.id));
    } catch {
      setError('Не удалось удалить вакансию.');
    }
  };

  const handleSubmit = async (input: VacancyInput) => {
    if (dialog?.vacancy) {
      const updated = await updateVacancy(dialog.vacancy.id, input);
      setVacancies((list) => list.map((v) => (v.id === updated.id ? updated : v)));
    } else {
      const created = await createVacancy(input);
      setVacancies((list) => [created, ...list]);
    }
    setDialog(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink">Вакансии и отклики</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Сохраняйте вакансии, планируйте шаги и фиксируйте отправленную версию.
      </p>
      <Button type="button" className="mt-6" onClick={() => setDialog({ vacancy: null })}>
        + Добавить вакансию
      </Button>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-600">{error}</p>
      )}

      <section aria-label="Список вакансий" className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-2xl font-semibold text-ink" aria-live="polite">Всего: {visible.length}</p>
          <Select label="Статус" value={filter} options={FILTER_OPTIONS} onChange={setFilter} className="w-36" />
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-muted">Загрузка…</p>
        ) : visible.length === 0 ? (
          <p className="mt-10 text-sm text-muted">Вакансий пока нет.</p>
        ) : (
          <ul className="mt-6">
            {visible.map((vacancy) => (
              <VacancyCard
                key={vacancy.id}
                vacancy={vacancy}
                onStatusChange={(status) => handleStatusChange(vacancy.id, status)}
                onEdit={() => setDialog({ vacancy })}
                onAdapt={() => navigate(`${ADAPTATION_PATH}?vacancy=${vacancy.id}`)}
                onDelete={() => handleDelete(vacancy)}
              />
            ))}
          </ul>
        )}
      </section>

      {dialog && (
        <VacancyDialog
          vacancy={dialog.vacancy}
          resumes={resumes}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}