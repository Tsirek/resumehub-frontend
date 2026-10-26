import type { AdaptationResult } from '../types';
import { mockDelay } from './client';

// Заглушка: словарь технологий и «навыки пользователя». Потом удалить.
const KNOWN_SKILLS = [
  'Python', 'FastAPI', 'Django', 'Flask', 'PostgreSQL', 'SQL', 'Docker', 'Kubernetes',
  'Redis', 'Kafka', 'RabbitMQ', 'Celery', 'Git', 'REST', 'TypeScript', 'React',
];
const MOCK_USER_SKILLS = new Set(['python', 'fastapi', 'postgresql', 'docker', 'sql', 'rest', 'git']);

const inText = (text: string, skill: string) =>
  new RegExp(`(^|[^a-z0-9])${skill}($|[^a-z0-9])`, 'i').test(text);

// BACKEND: POST /adaptation/analyze { vacancyText }
// Сервер сравнивает текст вакансии с проектами и опытом пользователя
// и не должен придумывать данные, которых у пользователя нет.
export async function analyzeVacancy(vacancyText: string): Promise<AdaptationResult> {
  // return request<AdaptationResult>('/adaptation/analyze', {
  //   method: 'POST',
  //   body: JSON.stringify({ vacancyText }),
  // });
  await mockDelay(400);

  const found = KNOWN_SKILLS.filter((s) => inText(vacancyText, s));
  const matched = found.filter((s) => MOCK_USER_SKILLS.has(s.toLowerCase()));
  const missing = found.filter((s) => !MOCK_USER_SKILLS.has(s.toLowerCase()));

  return {
    requirements: [
      ...(matched.length ? [{ label: matched.join(', '), matched: true }] : []),
      ...missing.map((label) => ({ label, matched: false })),
    ],
    advice: matched.length
      ? {
          projectName: 'Roomly',
          text: 'Покажите проект с REST API и PostgreSQL первым. Уточните, какие задачи реализовали лично.',
        }
      : null,
  };
}