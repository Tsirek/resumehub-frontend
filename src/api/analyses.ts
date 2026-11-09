import type {
  AnalysisError,
  AnalysisRepository,
  AnalysisResult,
  AnalysisStatus,
  GithubAnalysis,
} from '../types';
import { mockDelay } from './client';

// ---------- Контракт бэкенда (snake_case, см. ResumeHub_GitHub_Analysis_RU.pdf) ----------

interface AnalysisDto {
  id: string;
  status: AnalysisStatus;
  repository_ids?: number[];
  // BACKEND: нет в черновом контракте. Нужен, чтобы показывать названия и ссылки репозиториев.
  repositories?: { id: number; name: string; url: string }[];
  repositories_count: number;
  repositories_processed: number;
  created_at: string;
  updated_at?: string;
  result: {
    summary: string;
    skills: string[];
    resume_bullets: string[];
    repository_summaries: {
      repository_id: number;
      summary: string;
      technologies: string[];
      commit_sha: string;
      contribution_note: string | null;
      // BACKEND: нет в черновом контракте
      stats?: { files_analyzed: number; languages: number; dependencies: number; modules: number };
    }[];
  } | null;
  error: {
    code: string;
    stage: AnalysisStatus | null;
    message: string;
    retryable: boolean;
  } | null;
}

/** Нужен, когда будет подключён реальный request(); пока используется только в закомментированных вызовах */
export function fromDto(dto: AnalysisDto): GithubAnalysis {
  const repositories: AnalysisRepository[] =
    dto.repositories?.map((r) => ({ id: String(r.id), name: r.name, url: r.url })) ??
    (dto.repository_ids ?? []).map((id) => ({ id: String(id), name: String(id), url: '' }));

  const result: AnalysisResult | null = dto.result && {
    summary: dto.result.summary,
    skills: dto.result.skills,
    resumeBullets: dto.result.resume_bullets,
    repositorySummaries: dto.result.repository_summaries.map((s) => ({
      repositoryId: String(s.repository_id),
      summary: s.summary,
      technologies: s.technologies,
      commitSha: s.commit_sha,
      contributionNote: s.contribution_note,
      stats: s.stats && {
        filesAnalyzed: s.stats.files_analyzed,
        languages: s.stats.languages,
        dependencies: s.stats.dependencies,
        modules: s.stats.modules,
      },
    })),
  };

  const error: AnalysisError | null = dto.error;

  return {
    id: dto.id,
    status: dto.status,
    repositories,
    repositoriesCount: dto.repositories_count,
    repositoriesProcessed: dto.repositories_processed,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at ?? dto.created_at,
    result,
    error,
  };
}

// ---------- Тестовое хранилище. Потом удалить ----------

const STEP_MS = 8000; // сколько «занимает» анализ одного репозитория в заглушке
const MIN = 60_000;

const makeRepo = (name: string): AnalysisRepository => ({
  id: name,
  name,
  url: `https://github.com/username/${name}`,
});

function buildMockResult(repos: AnalysisRepository[]): AnalysisResult {
  return {
    summary:
      'ИИ изучил структуру репозитория, исходный код, конфигурационные файлы и зависимости. На основе анализа сформирован технический профиль проекта с основными технологиями, инструментами и компетенциями, которые можно использовать при адаптации резюме.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Pytest', 'GitHub'],
    resumeBullets: [
      'Разработка REST API и проектирование серверной архитектуры',
      'Работа с базами данных, ORM и миграциями',
      'Автоматизированное тестирование и контейнеризация',
    ],
    repositorySummaries: repos.map((r) => ({
      repositoryId: r.id,
      summary: '',
      technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Pytest', 'GitHub'],
      commitSha: '9f3a2c1',
      contributionNote: null,
      stats: { filesAnalyzed: 128, languages: 4, dependencies: 23, modules: 8 },
    })),
  };
}

const seedActive = (name: string, agoMs: number): GithubAnalysis => ({
  id: `demo-${name}`,
  status: 'ANALYZING',
  repositories: [makeRepo(name)],
  repositoriesCount: 1,
  repositoriesProcessed: 0,
  createdAt: new Date(Date.now() - agoMs).toISOString(),
  updatedAt: new Date(Date.now() - agoMs).toISOString(),
  result: null,
  error: null,
});

const seedDone = (name: string, agoMs: number): GithubAnalysis => {
  const repos = [makeRepo(name)];
  return {
    id: `demo-${name}`,
    status: 'COMPLETED',
    repositories: repos,
    repositoriesCount: 1,
    repositoriesProcessed: 1,
    createdAt: new Date(Date.now() - agoMs - MIN).toISOString(),
    updatedAt: new Date(Date.now() - agoMs).toISOString(),
    result: buildMockResult(repos),
    error: null,
  };
};

let mockStore: GithubAnalysis[] = [
  seedActive('roomy-api', 3000),
  seedActive('portfolio-frontend', 1000),
  seedDone('data-scientist-toolkit', 30 * MIN),
  seedDone('backend-developer', 60 * MIN),
  seedDone('ui-components', 20 * 60 * MIN),
  seedDone('marketing-platform', 26 * 60 * MIN),
  {
    ...seedDone('legacy-service', 28 * 60 * MIN),
    id: 'demo-legacy-service',
    status: 'FAILED',
    result: null,
    error: {
      code: 'AGGREGATION_FAILED',
      stage: 'AGGREGATING',
      message: 'Не удалось сформировать общую сводку.',
      retryable: true,
    },
  },
];

/** Имитация работы воркера: статус меняется со временем, как при опросе реального API */
function advance(a: GithubAnalysis): GithubAnalysis {
  if (a.status === 'COMPLETED' || a.status === 'FAILED') return a;

  const elapsed = Date.now() - Date.parse(a.createdAt);
  const n = a.repositoriesCount;
  const processed = Math.min(n, Math.floor(elapsed / STEP_MS));

  if (elapsed < 1500) return { ...a, status: 'PENDING' };
  if (processed < n) return { ...a, status: 'ANALYZING', repositoriesProcessed: processed };
  if (elapsed < (n + 1) * STEP_MS) {
    return { ...a, status: 'AGGREGATING', repositoriesProcessed: n };
  }
  return {
    ...a,
    status: 'COMPLETED',
    repositoriesProcessed: n,
    updatedAt: new Date().toISOString(),
    result: buildMockResult(a.repositories),
  };
}

// BACKEND: GET /github/analyses — история задач. В PDF метод только предложен, пагинацию
// (limit/cursor) нужно согласовать. Двух основных endpoint недостаточно для восстановления истории.
export async function listAnalyses(): Promise<GithubAnalysis[]> {
  // const page = await request<{ items: AnalysisDto[] }>('/github/analyses?limit=50');
  // return page.items.map(fromDto);
  await mockDelay(400);
  mockStore = mockStore.map(advance);
  return [...mockStore].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

// BACKEND: GET /github/analyses/{id} — статус одной задачи (опрос раз в 3–5 секунд, пока задача активна)
export async function getAnalysis(id: string): Promise<GithubAnalysis> {
  // return fromDto(await request<AnalysisDto>(`/github/analyses/${id}`));
  await mockDelay(200);
  const found = mockStore.find((a) => a.id === id);
  if (!found) throw new Error('Analysis not found');
  const next = advance(found);
  mockStore = mockStore.map((a) => (a.id === id ? next : a));
  return next;
}

// BACKEND: POST /github/analyses → 202 Accepted. Одна задача на весь набор репозиториев.
// Idempotency-Key защищает от дубля, если ответ потерялся из-за сети.
// Названия и ссылки репозиториев в ответе POST не приходят, поэтому передаём их с клиента.
export async function createAnalysis(
  repositories: AnalysisRepository[],
  idempotencyKey: string,
): Promise<GithubAnalysis> {
  // const dto = await request<AnalysisDto>('/github/analyses', {
  //   method: 'POST',
  //   headers: { 'Idempotency-Key': idempotencyKey }, // проверить, что request() принимает headers
  //   body: JSON.stringify({ repository_ids: repositories.map((r) => Number(r.id)) }), // в контракте id числовые
  // });
  // return { ...fromDto(dto), repositories };
  void idempotencyKey;
  await mockDelay(600);

  const unique = [...new Map(repositories.map((r) => [r.id, r])).values()]; // бэкенд тоже удаляет дубли
  const now = new Date().toISOString();
  const created: GithubAnalysis = {
    id: crypto.randomUUID(),
    status: 'PENDING',
    repositories: unique,
    repositoriesCount: unique.length,
    repositoriesProcessed: 0,
    createdAt: now,
    updatedAt: now,
    result: null,
    error: null,
  };
  mockStore = [created, ...mockStore];
  return created;
}

// BACKEND: DELETE /github/analyses/{id} — в PDF не описан, метод нужно добавить
export async function deleteAnalysis(id: string): Promise<void> {
  // await request<void>(`/github/analyses/${id}`, { method: 'DELETE' });
  await mockDelay(300);
  mockStore = mockStore.filter((a) => a.id !== id);
}

// BACKEND: «Использовать в резюме» — в PDF не описано. Нужно решить, в какое резюме и какие
// разделы попадают данные (навыки → skills, resume_bullets → опыт/проекты) и нужен ли выбор резюме.
export async function applyAnalysisToResume(analysisId: string): Promise<void> {
  // await request<void>(`/github/analyses/${analysisId}/apply`, { method: 'POST', body: JSON.stringify({ resumeId }) });
  void analysisId;
  await mockDelay(500);
}