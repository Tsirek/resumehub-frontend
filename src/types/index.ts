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
  refreshToken: string;
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
  skills: string;
  education: string;
  additional: string;
}