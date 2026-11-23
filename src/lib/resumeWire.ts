import type { AdditionalEntry, EducationEntry, ExperienceEntry, ProjectEntry, ResumeContacts, ResumeContent } from '../types';
import { createEmptyExperience, createEmptyProject } from './resumeContent';

/** Старые текстовые поля остаются совместимыми; структура редактора хранится отдельно. */
export interface ResumeWireContent {
  contacts: ResumeContacts;
  about: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string;
  education: string;
  additional: string;
  skillItems?: string[];
  educationEntries?: EducationEntry[];
  additionalEntries?: AdditionalEntry[];
}
export function fromResumeWire(content: ResumeWireContent): ResumeContent {
  return {
    contacts: { ...content.contacts }, about: content.about,
    experience: content.experience.length ? content.experience : [createEmptyExperience()],
    projects: content.projects.length ? content.projects : [createEmptyProject()],
    skills: content.skillItems?.length ? content.skillItems : content.skills.split(/[,\n]/).map(value => value.trim()).filter(Boolean),
    education: content.educationEntries?.length ? content.educationEntries : content.education ? [{ id: crypto.randomUUID(), institution: content.education, specialty: '', period: '' }] : [],
    additional: content.additionalEntries?.length ? content.additionalEntries : content.additional ? [{ id: crypto.randomUUID(), title: '', description: content.additional }] : [],
  };
}
export function toResumeWire(content: ResumeContent): ResumeWireContent {
  return {
    contacts: { ...content.contacts }, about: content.about, experience: content.experience, projects: content.projects,
    skills: content.skills.join('\n'),
    education: content.education.map(entry => [entry.institution, entry.specialty, entry.period].filter(Boolean).join('\n')).filter(Boolean).join('\n\n'),
    additional: content.additional.map(entry => [entry.title, entry.description].filter(Boolean).join('\n')).filter(Boolean).join('\n\n'),
    skillItems: [...content.skills], educationEntries: content.education, additionalEntries: content.additional,
  };
}
