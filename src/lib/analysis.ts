import type { AnalysisRepository, GithubAnalysis } from '../types';

export const isActiveAnalysis = (a: Pick<GithubAnalysis, 'status'>) =>
  a.status !== 'COMPLETED' && a.status !== 'FAILED';

export function getAnalysisTitle(repos: AnalysisRepository[]): string {
  if (repos.length === 1) return `Анализ репозитория ${repos[0].name}`;
  const names = repos
    .slice(0, 3)
    .map((r) => r.name)
    .join(', ');
  const rest = repos.length - 3;
  return `Анализ репозиториев: ${names}${rest > 0 ? ` и ещё ${rest}` : ''}`;
}

export function getStageText(a: GithubAnalysis): string {
  switch (a.status) {
    case 'PENDING':
      return 'В очереди';
    case 'ANALYZING':
      return `Анализ репозиториев: ${a.repositoriesProcessed} из ${a.repositoriesCount}`;
    case 'AGGREGATING':
      return 'Формируем общую сводку';
    case 'COMPLETED':
      return a.repositoriesCount === 1
        ? 'Репозиторий успешно проанализирован'
        : 'Репозитории успешно проанализированы';
    case 'FAILED':
      return a.error?.message ?? 'Не удалось выполнить анализ';
  }
}

export function getProgressPercent(a: GithubAnalysis): number {
  switch (a.status) {
    case 'PENDING':
      return 5;
    case 'ANALYZING':
      return 10 + Math.round((a.repositoriesProcessed / Math.max(a.repositoriesCount, 1)) * 70);
    case 'AGGREGATING':
      return 90;
    default:
      return 100;
  }
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** «Сегодня, 14:32» / «Вчера, 19:20» / «08.11.2026, 18:15» в часовом поясе пользователя */
export function formatAnalysisDate(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (diffDays === 0) return `Сегодня, ${time}`;
  if (diffDays === 1) return `Вчера, ${time}`;
  return `${date.toLocaleDateString('ru-RU')}, ${time}`;
}