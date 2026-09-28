import { useEffect, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { createResume, getResumes } from '../../api/resumes';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import type { Resume } from '../../types';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getResumes() // BACKEND: GET /resumes
      .then((data) => !cancelled && setResumes(data))
      .catch(() => !cancelled && setError('Не удалось загрузить резюме'));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const resume = await createResume(); // BACKEND: POST /resumes
      setResumes((prev) => [...(prev ?? []), resume]);
      // TODO: после появления редактора — navigate(`/app/resumes/${resume.id}`)
    } catch {
      setError('Не удалось создать резюме');
    } finally {
      setCreating(false);
    }
  };

  const createButton = (
    <Button size="lg" onClick={handleCreate} loading={creating}>
      <Plus aria-hidden className="size-5" /> Создать резюме
    </Button>
  );

  return (
    <>
      <PageHeader title="Мои резюме" subtitle="Создавайте отдельные варианты для разных ролей" />

      {error && <p role="alert" className="mb-6 text-red-600">{error}</p>}

      {resumes === null && !error && <p className="text-muted">Загрузка…</p>}

      {resumes?.length === 0 && (
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-medium text-ink">Пока нет резюме</h2>
          <p className="mt-6 text-sm font-medium text-muted">
            Создайте первый документ — можно начать с пустого шаблона.
          </p>
          <div className="mt-5">{createButton}</div>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <>
          <div className="mb-6">{createButton}</div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resumes.map((resume) => (
              <li key={resume.id} className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <FileText aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="font-medium text-ink">{resume.title}</p>
                  <p className="text-xs text-muted">Изменено {formatDate(resume.updatedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}