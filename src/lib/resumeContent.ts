import type { ExperienceEntry, ProjectEntry, ResumeContent } from '../types';

export const createEmptyExperience = (): ExperienceEntry => ({
  id: crypto.randomUUID(),
  company: '',
  role: '',
  period: '',
  achievements: '',
});

export const createEmptyProject = (): ProjectEntry => ({
  id: crypto.randomUUID(),
  name: '',
  technologies: '',
  contribution: '',
});

/** В формах всегда есть хотя бы одна запись, поэтому по умолчанию по одной пустой */
export const createEmptyContent = (): ResumeContent => ({
  contacts: { fullName: '', position: '', email: '', location: '' },
  about: '',
  experience: [createEmptyExperience()],
  projects: [createEmptyProject()],
  skills: '',
  education: '',
  additional: '',
});

const isBlank = (...values: string[]) => values.every((v) => v.trim() === '');

export const isExperienceEmpty = (e: ExperienceEntry) =>
  isBlank(e.company, e.role, e.period, e.achievements);

export const isProjectEmpty = (p: ProjectEntry) => isBlank(p.name, p.technologies, p.contribution);