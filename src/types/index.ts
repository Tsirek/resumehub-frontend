export type ResumeStatus = 'draft' | 'ready';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Profile {
  fullName: string;
  specialization: string;
  about: string;
}

export interface Resume {
  id: string;
  title: string;
  status: ResumeStatus;
  position: string | null; // null → «Должность не указана»
  projectsCount: number;
  workplacesCount: number;
  updatedAt: string; // ISO-дата
}

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface ResumeContacts {
  fullName: string;
  position: string;
  email: string;
  location: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  period: string;
  achievements: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  technologies: string;
  contribution: string;
  repoId?: string; // id репозитория Github, если проект импортирован
}

export interface ResumeContent {
  contacts: ResumeContacts;
  about: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string[];
  education: EducationEntry[];
  additional: AdditionalEntry[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  specialty: string;
  period: string;
}

export interface AdditionalEntry {
  id: string;
  title: string; // тип, язык, сертификат, публикация
  description: string;
}

export type VacancyStatus = 'saved' | 'sent' | 'interview' | 'offer' | 'rejected';

export interface Vacancy {
  id: string;
  company: string;
  position: string;
  resumeId: string | null;
  resumeTitle: string | null; // BACKEND: название резюме лучше отдавать с сервера вместе с вакансией
  nextStepDate: string | null; // YYYY-MM-DD
  status: VacancyStatus;
  description: string; // текст вакансии
}

export type VacancyInput = Omit<Vacancy, 'id'>;

export interface RequirementMatch {
  label: string;
  matched: boolean; // true → «Есть в проекте», false → «Уточнить опыт»
}

export interface AdaptationResult {
  requirements: RequirementMatch[];
  advice: { projectName: string; text: string } | null;
}