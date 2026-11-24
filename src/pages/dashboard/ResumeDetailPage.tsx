import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Upload } from "lucide-react";
import {
  exportResumePdf,
  getResume,
  loadResumeContent,
  saveResumeContent,
} from "../../api/resumes";
import { errorMessage } from "../../api/client";
import { SaveQueue } from "../../lib/saveQueue";
import { session } from "../../lib/session";
import { AboutForm } from "../../components/resume-editor/AboutForm";
import { AdditionalForm } from "../../components/resume-editor/AdditionalForm";
import { ContactsForm } from "../../components/resume-editor/ContactsForm";
import { EducationForm } from "../../components/resume-editor/EducationForm";
import { ExperienceForm } from "../../components/resume-editor/ExperienceForm";
import { ImagesForm } from "../../components/resume-editor/ImagesForm";
import { LivePreview } from "../../components/resume-editor/LivePreview";
import { useResumeImages } from "../../hooks/useResumeImages";
import { ProjectsForm } from "../../components/resume-editor/ProjectsForm";
import { SectionTabs } from "../../components/resume-editor/SectionTabs";
import { SkillsForm } from "../../components/resume-editor/SkillsForm";
import {
  SECTIONS,
  isSectionId,
  type SectionId,
} from "../../components/resume-editor/sections";
import { Button } from "../../components/ui/Button";
import { buttonClasses } from "../../components/ui/buttonStyles";
import { usePageTitle } from "../../hooks/usePageTitle";
import { ROUTES } from "../../router/paths";
import type { Resume, ResumeContent } from "../../types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  saving: "Сохраняем…",
  saved: "Сохранено",
  error: "Не удалось сохранить",
};

const SAVE_DELAY_MS = 800;

export default function ResumeDetailPage() {
  const { id } = useParams();
  return <ResumeEditor key={id} />;
}

function ResumeEditor() {
  const { id = "" } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [resume, setResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [exporting, setExporting] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");
  const images = useResumeImages(id);

  const queue = useRef<SaveQueue<ResumeContent> | null>(null);
  const version = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveError, setSaveError] = useState("");
  const draftKey = `rh-draft:${session.getUser()?.id}:${id}`;

  usePageTitle(resume ? `Резюме / ${resume.title}` : null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    Promise.all([getResume(id, controller.signal), loadResumeContent(id, controller.signal)])
      .then(([loadedResume, loaded]) => {
        if (!active) return;
        let initial = loaded.content;
        let etag = loaded.etag;
        let restored = false;
        try {
          const raw = sessionStorage.getItem(draftKey);
          if (raw) {
            const draft = JSON.parse(raw) as { content: ResumeContent; etag: string | null };
            initial = draft.content; etag = draft.etag; restored = true;
          }
        } catch { /* Недоступное хранилище не блокирует редактор. */ }
        version.current = etag;
        const writer = new SaveQueue<ResumeContent>(async (value) => {
          etag = await saveResumeContent(id, value, etag);
          version.current = etag;
          try {
            const raw = sessionStorage.getItem(draftKey);
            if (raw) {
              const draft = JSON.parse(raw) as { content: ResumeContent };
              if (JSON.stringify(draft.content) === JSON.stringify(value)) sessionStorage.removeItem(draftKey);
              else sessionStorage.setItem(draftKey, JSON.stringify({ content: draft.content, etag }));
            }
          } catch { /* Серверное сохранение уже состоялось. */ }
        });
        queue.current = writer;
        setResume(loadedResume); setContent(initial);
        if (restored) { writer.enqueue(initial); setSaveStatus("error"); setSaveError("Восстановлен локальный черновик. Сохраните его или загрузите версию сервера."); }
      }).catch(() => { if (active) setLoadError(true); });
    return () => {
      active = false; controller.abort();
      if (timer.current) clearTimeout(timer.current);
      void queue.current?.flush().catch(() => {});
      queue.current = null;
    };
  }, [id, draftKey]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    setSaveStatus("saving");
    try {
      await queue.current?.flush();
      setSaveStatus("saved"); setSaveError("");
    } catch (error) {
      setSaveStatus("error"); setSaveError(errorMessage(error)); throw error;
    }
  }, []);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (queue.current?.dirty) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);
  const updateContent = useCallback((updater: (prev: ResumeContent) => ResumeContent) => {
    if (!content) return;
    const next = updater(content);
    setContent(next); queue.current?.enqueue(next);
    try { sessionStorage.setItem(draftKey, JSON.stringify({ content: next, etag: version.current })); }
    catch { /* Автосохранение работает и без локального хранилища. */ }
    setSaveStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void flush().catch(() => {}); }, SAVE_DELAY_MS);
  }, [content, draftKey, flush]);

  const sectionParam = searchParams.get("section");
  const current: SectionId = isSectionId(sectionParam)
    ? sectionParam
    : "contacts";
  const index = SECTIONS.findIndex((s) => s.id === current);

  const goTo = (section: SectionId) =>
    setSearchParams({ section }, { replace: true });

  const step = (delta: number) => {
    goTo(SECTIONS[index + delta].id);
    window.scrollTo({ top: 0 });
  };

  const handleExport = async () => {
    setExporting(true);
    setPdfMessage("");
    try {
      await flush();
      await exportResumePdf(id, resume?.title);
      setPdfMessage("PDF скачан");
    } catch (error) {
      setPdfMessage(errorMessage(error));
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
        <Link
          to={ROUTES.resumes}
          className={buttonClasses({ variant: "secondary", size: "sm" })}
        >
          <ArrowLeft aria-hidden className="size-4" /> Все резюме
        </Link>
      </div>
    );
  }

  if (!resume || !content) return <p className="text-muted">Загрузка…</p>;

  const renderSection = () => {
    switch (current) {
      case "contacts":
        return (
          <ContactsForm
            value={content.contacts}
            onChange={(contacts) => updateContent((c) => ({ ...c, contacts }))}
          />
        );
      case "images":
        return (
          <ImagesForm
            name={content.contacts.fullName}
            images={images.images}
            urls={images.urls}
            loading={images.loading}
            busy={images.busy}
            error={images.error}
            avatarUrl={images.avatarUrl}
            onAvatarUrlExpired={images.refreshAvatar}
            onUpload={(files) => { void images.upload(files); }}
            onUploadAvatar={(file) => { void images.upload([file], "avatar"); }}
            onSelectAvatar={(imageId) => { void images.selectAvatar(imageId); }}
            onRemove={(imageId) => { void images.remove(imageId); }}
            onUrlExpired={images.refreshUrl}
          />
        );
      case "about":
        return (
          <AboutForm
            value={content.about}
            onChange={(about) => updateContent((c) => ({ ...c, about }))}
          />
        );
      case "experience":
        return (
          <ExperienceForm
            value={content.experience}
            onChange={(experience) =>
              updateContent((c) => ({ ...c, experience }))
            }
          />
        );
      case "projects":
        return (
          <ProjectsForm
            value={content.projects}
            onChange={(projects) => updateContent((c) => ({ ...c, projects }))}
          />
        );
      case "skills":
        return (
          <SkillsForm
            skills={content.skills}
            onChange={(skills) => updateContent((c) => ({ ...c, skills }))}
          />
        );
      case "education":
        return (
          <EducationForm
            entries={content.education}
            onChange={(education) =>
              updateContent((c) => ({ ...c, education }))
            }
          />
        );
      case "additional":
        return (
          <AdditionalForm
            entries={content.additional}
            onChange={(additional) =>
              updateContent((c) => ({ ...c, additional }))
            }
          />
        );
    }
  };

  return (
    <div className="max-w-3xl">
      <Link
        to={ROUTES.resumes}
        className={buttonClasses({ variant: "secondary", size: "sm" })}
      >
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

      {saveError && <div role="alert" className="mb-4 text-sm text-red-700">
        <p>{saveError}</p>
        <Button size="sm" variant="secondary" onClick={() => { void flush().catch(() => {}); }}>Повторить сохранение</Button>
        <Button size="sm" variant="secondary" onClick={() => { sessionStorage.removeItem(draftKey); window.location.reload(); }}>Загрузить версию сервера</Button>
      </div>}
      <SectionTabs current={current} onSelect={goTo} />

      <div className="mt-6">{renderSection()}</div>

      <div className="mt-8">
        <LivePreview content={content} avatarUrl={images.avatarUrl} onAvatarError={images.refreshAvatar} />
      </div>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted">
          Изменения автоматически сохраняются на сервере.{" "}
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
