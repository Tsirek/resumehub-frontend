import { useEffect, useState } from 'react';
import { createResume, deleteResume, duplicateResume, getResumes, renameResume } from '../../api/resumes';
import { PageHeader } from '../../components/layout/PageHeader';
import { ResumeCard } from '../../components/resumes/ResumeCard';
import { ResumeNameDialog } from '../../components/resumes/ResumeNameDialog';
import { Button } from '../../components/ui/Button';
import type { Resume } from '../../types';

type DialogState = { mode: 'create' } | { mode: 'rename'; resume: Resume } | null;

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getResumes() // BACKEND: GET /resumes
      .then((data) => !cancelled && setResumes(data))
      .catch(() => !cancelled && setError('Не удалось загрузить резюме'));
    return () => {
      cancelled = true;
    };
  }, []);

  // Создание и переименование. Ошибки уходят в диалог, он покажет сообщение.
  const handleSubmitName = async (title: string) => {
    if (!dialog) return;

    if (dialog.mode === 'create') {
      const resume = await createResume(title); // BACKEND: POST /resumes
      setResumes((prev) => [resume, ...(prev ?? [])]);
    } else {
      const updated = await renameResume(dialog.resume.id, title); // BACKEND: PATCH /resumes/:id
      setResumes((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? prev);
    }
    setDialog(null);
  };

  const runAction = async (id: string, action: () => Promise<void>, errorText: string) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
    } catch {
      setError(errorText);
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = (resume: Resume) =>
    runAction(
      resume.id,
      async () => {
        const copy = await duplicateResume(resume.id); // BACKEND: POST /resumes/:id/duplicate
        setResumes((prev) => [copy, ...(prev ?? [])]);
      },
      'Не удалось скопировать резюме',
    );

  const handleDelete = (resume: Resume) => {
    // TODO: в макете нет окна подтверждения удаления. Пока системный confirm, потом заменить на Modal.
    if (!window.confirm(`Удалить резюме «${resume.title}»?`)) return;

    return runAction(
      resume.id,
      async () => {
        await deleteResume(resume.id); // BACKEND: DELETE /resumes/:id
        setResumes((prev) => prev?.filter((r) => r.id !== resume.id) ?? prev);
      },
      'Не удалось удалить резюме',
    );
  };

  return (
    <>
      <PageHeader
        title="Мои резюме"
        subtitle="Создавайте отдельные варианты для разных ролей"
        action={
          <Button size="lg" className="rounded-full! px-10" onClick={() => setDialog({ mode: 'create' })}>
            Создать резюме
          </Button>
        }
      />

      {error && (
        <p role="alert" className="mb-6 text-red-600">
          {error}
        </p>
      )}

      {resumes === null && !error && <p className="text-muted">Загрузка…</p>}

      {resumes?.length === 0 && (
        <div className="text-center">
          <h2 className="text-2xl font-medium text-ink">Пока нет резюме</h2>
          <p className="mt-4 text-sm font-medium text-muted">
            Нажмите «Создать резюме», чтобы добавить первый документ.
          </p>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <ul className="flex flex-col gap-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              busy={busyId === resume.id}
              onRename={(r) => setDialog({ mode: 'rename', resume: r })}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <ResumeNameDialog
        open={dialog !== null}
        mode={dialog?.mode ?? 'create'}
        initialTitle={dialog?.mode === 'rename' ? dialog.resume.title : ''}
        onSubmit={handleSubmitName}
        onClose={() => setDialog(null)}
      />
    </>
  );
}