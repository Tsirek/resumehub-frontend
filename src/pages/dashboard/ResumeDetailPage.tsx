import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Upload } from 'lucide-react';
import { exportResumePdf, getResume, getResumeContent, saveResumeContent } from '../../api/resumes';
import { AboutForm } from '../../components/resume-editor/AboutForm';
import { ContactsForm } from '../../components/resume-editor/ContactsForm';
import { ExperienceForm } from '../../components/resume-editor/ExperienceForm';
import { LivePreview } from '../../components/resume-editor/LivePreview';
import { ProjectsForm } from '../../components/resume-editor/ProjectsForm';
import { SectionTabs } from '../../components/resume-editor/SectionTabs';
import { TextSectionForm } from '../../components/resume-editor/TextSectionForm';
import { SECTIONS, isSectionId, type SectionId } from '../../components/resume-editor/sections';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ROUTES } from '../../router/paths';
import type { Resume, ResumeContent } from '../../types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Сохраняем…',
  saved: 'Сохранено',
  error: 'Не удалось сохранить',
};

const SAVE_DELAY_MS = 800;

export default function ResumeDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [resume, setResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [exporting, setExporting] = useState(false);
  const [pdfMessage, setPdfMessage] = useState('');

  const dirty = useRef(false); // были ли правки пользователя (чтобы не сохранять сразу после загрузки)
  const pendingSave = useRef<ResumeContent | null>(null);

  usePageTitle(resume ? `Резюме / ${resume.title}` : null);

  useEffect(() => {
    let cancelled = false;
    dirty.current = false;
    // BACKEND: GET /resumes/:id и GET /resumes/:id/content (api/resumes.ts)
    Promise.all([getResume(id), getResumeContent(id)])
      .then(([loadedResume, loadedContent]) => {
        if (cancelled) return;
        setResume(loadedResume);
        setContent(loadedContent);
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Автосохранение с задержкой
  useEffect(() => {
    if (!content || !dirty.current) return;
    pendingSave.current = content;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      pendingSave.current = null;
      saveResumeContent(id, content) // BACKEND: PUT /resumes/:id/content
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('error'));
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [content, id]);

  // Если ушли со страницы раньше, чем сработал таймер, сохраняем последние правки сразу
  useEffect(
    () => () => {
      const pending = pendingSave.current;
      pendingSave.current = null;
      if (pending) void saveResumeContent(id, pending).catch(() => {});
    },
    [id],
  );

  const updateContent = useCallback((updater: (prev: ResumeContent) => ResumeContent) => {
    dirty.current = true;
    setContent((prev) => (prev ? updater(prev) : prev));
  }, []);

  const sectionParam = searchParams.get('section');
  const current: SectionId = isSectionId(sectionParam) ? sectionParam : 'contacts';
  const index = SECTIONS.findIndex((s) => s.id === current);

  const goTo = (section: SectionId) => setSearchParams({ section }, { replace: true });

  const step = (delta: number) => {
    goTo(SECTIONS[index + delta].id);
    window.scrollTo({ top: 0 });
  };

  const handleExport = async () => {
    setExporting(true);
    setPdfMessage('');
    try {
      if (content) await saveResumeContent(id, content);
      await exportResumePdf(id); // BACKEND: GET /resumes/:id/pdf
      setPdfMessage('PDF скачан');
    } catch (e) {
      setPdfMessage(e instanceof Error ? e.message : 'Не удалось подготовить PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="alert" className="text-red-600">
          Не удалось загрузить резюме
        </p>
        <Link to={ROUTES.resumes} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
          <ArrowLeft aria-hidden className="size-4" /> Все резюме
        </Link>
      </div>
    );
  }

  if (!resume || !content) return <p className="text-muted">Загрузка…</p>;

  const renderSection = () => {
    switch (current) {
      case 'contacts':
        return (
          <ContactsForm
            value={content.contacts}
            onChange={(contacts) => updateContent((c) => ({ ...c, contacts }))}
          />
        );
      case 'about':
        return <AboutForm value={content.about} onChange={(about) => updateContent((c) => ({ ...c, about }))} />;
      case 'experience':
        return (
          <ExperienceForm
            value={content.experience}
            onChange={(experience) => updateContent((c) => ({ ...c, experience }))}
          />
        );
      case 'projects':
        return (
          <ProjectsForm
            value={content.projects}
            onChange={(projects) => updateContent((c) => ({ ...c, projects }))}
          />
        );
      case 'skills':
        return (
          <TextSectionForm
            title="Навыки"
            label="Ваши навыки"
            placeholder="Python, FastAPI, PostgreSQL, Docker"
            value={content.skills}
            onChange={(skills) => updateContent((c) => ({ ...c, skills }))}
          />
        );
      case 'education':
        return (
          <TextSectionForm
            title="Образование"
            label="Учебные заведения и курсы"
            value={content.education}
            onChange={(education) => updateContent((c) => ({ ...c, education }))}
          />
        );
      case 'additional':
        return (
          <TextSectionForm
            title="Дополнительно"
            label="Языки, сертификаты, публикации"
            value={content.additional}
            onChange={(additional) => updateContent((c) => ({ ...c, additional }))}
          />
        );
    }
  };

  return (
    <div className="max-w-3xl">
      <Link to={ROUTES.resumes} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
        <ArrowLeft aria-hidden className="size-4" /> Все резюме
      </Link>

      <p className="mt-4 max-w-md text-xs font-medium text-muted">
        Разделы, подтверждённый опыт и оформление — под вашим контролем.
      </p>
      <h1 className="mt-3 text-2xl font-bold text-ink">{resume.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={handleExport} loading={exporting}>
          <Upload aria-hidden className="size-4" /> PDF
        </Button>
        <span role="status" className="text-xs text-muted">
          {pdfMessage}
        </span>
      </div>

      <hr className="my-6 border-line" />

      <SectionTabs current={current} onSelect={goTo} />

      <div className="mt-6">{renderSection()}</div>

      <div className="mt-8">
        <LivePreview content={content} />
      </div>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted">
          Изменения сохраняются автоматически.{' '}
          <span aria-live="polite">{STATUS_TEXT[saveStatus]}</span>
        </p>
        <div className="flex gap-3">
          {index > 0 && (
            <Button variant="secondary" size="sm" onClick={() => step(-1)}>
              Предыдущий раздел
            </Button>
          )}
          {index < SECTIONS.length - 1 && (
            <Button size="sm" onClick={() => step(1)}>
              Следующий раздел
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}