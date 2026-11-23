import type { ProjectEntry } from '../types';
import { isProjectEmpty } from './resumeContent';

/** Применяем только проверенный пользователем черновик, сохраняя ID записи. */
export function applyProjectAnalysis(projects: ProjectEntry[], draft: ProjectEntry): ProjectEntry[] {
  const existing = projects.find(project => project.repoId === draft.repoId);
  if (existing) return projects.map(project => project.id === existing.id ? { ...draft, id: existing.id } : project);
  return [...projects.filter(project => !isProjectEmpty(project)), draft];
}
