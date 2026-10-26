import type { ReactNode } from 'react';
import { isExperienceEmpty, isProjectEmpty } from '../../lib/resumeContent';
import type { ResumeContent } from '../../types';

function PreviewSection({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="text-xs font-medium text-ink">{title}</h3>
      {children && <div className="mt-2 space-y-3 text-[11px] leading-snug text-muted">{children}</div>}
    </div>
  );
}

/** Запись считается пустой, если все её текстовые поля состоят из пробелов */
const isBlank = (...values: string[]) => values.every((v) => v.trim() === '');

export function LivePreview({ content }: { content: ResumeContent }) {
  const { contacts } = content;
  const experience = content.experience.filter((e) => !isExperienceEmpty(e));
  const projects = content.projects.filter((p) => !isProjectEmpty(p));
  const skills = content.skills.map((s) => s.trim()).filter(Boolean);
  const education = content.education.filter((e) => !isBlank(e.institution, e.specialty, e.period));
  const additional = content.additional.filter((a) => !isBlank(a.title, a.description));

  return (
    <section aria-labelledby="preview-title">
      <h2 id="preview-title" className="mb-3 text-xl font-semibold text-muted">
        Предпросмотр
      </h2>

      <article className="rounded-2xl border border-line bg-white p-8 shadow-sm">
        <p className="text-2xl font-semibold text-ink">{contacts.fullName || 'Имя и фамилия'}</p>
        {contacts.position && <p className="mt-1 font-medium text-primary">{contacts.position}</p>}
        {contacts.location && <p className="mt-4 text-[11px] text-muted">{contacts.location}</p>}
        {contacts.email && <p className="text-[11px] text-ink underline">{contacts.email}</p>}

        <hr className="my-6 border-line" />

        <PreviewSection title="Профиль">
          {content.about.trim() ? <p className="whitespace-pre-line">{content.about}</p> : null}
        </PreviewSection>

        <PreviewSection title="Опыт">
          {experience.length > 0
            ? experience.map((e) => (
                <div key={e.id}>
                  <p className="font-semibold text-ink">{[e.role, e.company].filter(Boolean).join(', ')}</p>
                  {e.period && <p>{e.period}</p>}
                  {e.achievements && <p className="whitespace-pre-line">{e.achievements}</p>}
                </div>
              ))
            : null}
        </PreviewSection>

        <PreviewSection title="Проекты">
          {projects.length > 0
            ? projects.map((p) => (
                <div key={p.id}>
                  <p className="font-semibold text-ink">{p.name || 'Без названия'}</p>
                  {p.technologies && <p>{p.technologies}</p>}
                  {p.contribution && <p className="whitespace-pre-line">{p.contribution}</p>}
                </div>
              ))
            : null}
        </PreviewSection>

        <PreviewSection title="Навыки">
          {skills.length > 0 ? (
            <ul aria-label="Навыки" className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <li key={skill} className="rounded bg-primary-soft px-2 py-0.5 text-[11px] text-navy">
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}
        </PreviewSection>

        <PreviewSection title="Образование">
          {education.length > 0
            ? education.map((e) => (
                <div key={e.id}>
                  <p className="font-semibold text-ink">{e.institution || 'Без названия'}</p>
                  {e.specialty && <p>{e.specialty}</p>}
                  {e.period && <p>{e.period}</p>}
                </div>
              ))
            : null}
        </PreviewSection>

        <PreviewSection title="Дополнительно">
          {additional.length > 0
            ? additional.map((a) => (
                <div key={a.id}>
                  <p className="font-semibold text-ink">{a.title || 'Без названия'}</p>
                  {a.description && <p className="whitespace-pre-line">{a.description}</p>}
                </div>
              ))
            : null}
        </PreviewSection>
      </article>
    </section>
  );
}