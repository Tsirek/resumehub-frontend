import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';
import { errorMessage, request } from '../../api/client';
import { getCurrentReport, getLibrary, type CurrentReport, type LibraryProject } from '../../api/reports';
import type { ProjectEntry } from '../../types';
import { ROUTES } from '../../router/paths';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

type Props = { mode: 'about'; current: string; onApply: (text: string) => void; onClose: () => void }
  | { mode: 'project'; projects: ProjectEntry[]; onApply: (draft: ProjectEntry) => void; onClose: () => void };

export function AnalysisImportDialog(props: Props) {
  const titleId = useId();
  return <Dialog open onClose={props.onClose} labelledBy={titleId} className="max-w-2xl">
    <div className="max-h-[85vh] overflow-y-auto p-6">
      <h2 id={titleId} className="text-xl font-semibold">{props.mode === 'about' ? 'Использовать анализ для «О себе»' : 'Проект из сохранённого анализа'}</h2>
      <AnalysisContent {...props}/>
    </div>
  </Dialog>;
}

function AnalysisContent(props: Props) {
  const [data, setData] = useState<{ report: CurrentReport; library: LibraryProject[]; demo: boolean } | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getCurrentReport(controller.signal), getLibrary(controller.signal), request<{github_report_mode: string}>('/capabilities', {signal: controller.signal})])
      .then(([report, library, capabilities]) => { if (!controller.signal.aborted) { setData({report, library, demo: capabilities.github_report_mode === 'demo'}); setError(''); } })
      .catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); });
    return () => controller.abort();
  }, [attempt]);
  if (!data) return <div className="mt-5">{error ? <><p role="alert">{error}</p><Button onClick={() => setAttempt(value => value + 1)}>Повторить</Button></> : <p>Загружаем сохранённый анализ…</p>}<Button variant="secondary" className="mt-4" onClick={props.onClose}>Закрыть</Button></div>;
  return <>
    {data.demo && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Тестовый Core: это демонстрационный текст, а не подтверждённый опыт. Не отправляйте его работодателю без замены.</p>}
    <p className="mt-4 text-sm text-muted">Проверьте формулировки перед переносом. Текст можно отредактировать; в резюме сохранится отдельная копия, будущие отчёты её не изменят.</p>
    {props.mode === 'about' ? <AboutDraft {...props} report={data.report}/> : <ProjectDraft {...props} library={data.library}/>}
  </>;
}

function EmptyAnalysis({onClose}: {onClose: () => void}) {
  return <div className="mt-5 space-y-4"><p>Сохранённого анализа пока нет. Выберите репозитории в разделе «Проекты» и дождитесь завершения задачи.</p><Link to={ROUTES.projects} className="text-primary underline" onClick={onClose}>Перейти к анализу проектов</Link><div><Button variant="secondary" onClick={onClose}>Закрыть</Button></div></div>;
}

function AboutDraft({current, onApply, onClose, report}: Extract<Props,{mode:'about'}> & {report: CurrentReport}) {
  const [text, setText] = useState(report.summary_ru || report.report_text || '');
  if (!report.summary_ru && !report.report_text) return <EmptyAnalysis onClose={onClose}/>;
  return <div className="mt-5 space-y-4">
    {!report.is_current && <p role="status" className="text-sm text-amber-800">Это предыдущий отчёт. Выбор проектов изменился или новый анализ ещё не завершён.</p>}
    {!report.summary_ru && <p className="text-sm text-muted">Краткое описание отсутствует. Ниже полный текст отчёта: сократите его до подходящего описания себя.</p>}
    {current.trim() && <details><summary className="cursor-pointer text-sm">Текущее описание будет заменено — посмотреть</summary><p className="mt-2 whitespace-pre-wrap text-sm">{current}</p></details>}
    <Textarea label="Черновик «О себе»" rows={8} value={text} onChange={event => setText(event.target.value)}/>
    <LengthHint text={text}/>
    <div className="flex gap-3"><Button variant="secondary" onClick={onClose}>Отмена</Button><Button disabled={!text.trim() || text.length > 10000} onClick={() => onApply(text)}>{current.trim() ? 'Заменить текст «О себе»' : 'Добавить в «О себе»'}</Button></div>
  </div>;
}

function ProjectDraft(props: Extract<Props,{mode:'project'}> & {library: LibraryProject[]}) {
  const analyzed = props.library.filter(project => project.summary_ru || project.report_text);
  const [repoId, setRepoId] = useState(analyzed[0]?.repo_id ?? '');
  if (!analyzed.length) return <EmptyAnalysis onClose={props.onClose}/>;
  const project = analyzed.find(project => project.repo_id === repoId)!;
  return <div className="mt-5 space-y-4">
    <label className="block text-sm">Репозиторий<select className="mt-2 w-full rounded-xl border border-line p-3" value={repoId} onChange={event => setRepoId(event.target.value)}>{analyzed.map(project => <option key={project.repo_id} value={project.repo_id}>{project.full_name ?? project.name}</option>)}</select></label>
    <ProjectFields key={repoId} {...props} project={project}/>
  </div>;
}

function ProjectFields({projects, project, onApply, onClose}: Extract<Props,{mode:'project'}> & {project: LibraryProject}) {
  const existing = projects.find(entry => entry.repoId === project.repo_id);
  const [name, setName] = useState(existing?.name || project.name);
  const [technologies, setTechnologies] = useState(existing?.technologies || project.tags.join(', '));
  const [contribution, setContribution] = useState(project.summary_ru || project.report_text || '');
  return <>
    {!project.cache_matches_inputs && <p role="status" className="text-sm text-amber-800">Сохранённый анализ не соответствует текущим данным аккаунта, роли или периода. Проверьте его перед переносом.</p>}
    <p className="text-xs text-muted">Это сохранённый результат; свежесть GitHub сейчас не проверяется. Технологии описывают проект и не подтверждают ваши навыки.</p>
    {existing && <details><summary className="cursor-pointer text-sm">Проект уже есть в резюме — посмотреть текущее описание</summary><p className="mt-2 whitespace-pre-wrap text-sm">{existing.contribution || 'Описание не заполнено'}</p></details>}
    {!project.summary_ru && <p className="text-sm text-muted">Краткое описание отсутствует. Сократите полный отчёт ниже до своего личного вклада.</p>}
    <Input label="Название проекта" value={name} onChange={event => setName(event.target.value)}/>
    <Input label="Технологии проекта" value={technologies} onChange={event => setTechnologies(event.target.value)}/>
    <Textarea label="Черновик личного вклада" rows={7} value={contribution} onChange={event => setContribution(event.target.value)}/>
    <LengthHint text={contribution}/>
    <details><summary className="cursor-pointer text-sm">Посмотреть полный анализ</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm">{project.report_text}</p></details>
    <div className="flex gap-3"><Button variant="secondary" onClick={onClose}>Отмена</Button><Button disabled={!name.trim() || !contribution.trim() || [name, technologies, contribution].some(text => text.length > 10000)} onClick={() => onApply({id: existing?.id ?? crypto.randomUUID(), repoId: project.repo_id, name, technologies, contribution})}>{existing ? 'Обновить проект в резюме' : 'Добавить проект в резюме'}</Button></div>
  </>;
}

function LengthHint({text}: {text: string}) {
  return text.length > 10000 ? <p role="alert" className="text-sm text-red-700">Текст содержит {text.length} символов. Сократите до 10 000; автоматически текст не обрезается.</p> : null;
}
