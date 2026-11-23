import type { Resume, Vacancy, VacancyInput } from "../types";
import { request } from "./client";

export interface VacancyResumeSnapshot {
  id: string;
  title: string;
  content: {
    contacts: {
      fullName: string;
      position: string;
      email: string;
      location: string;
    };
    about: string;
    experience: {
      id: string;
      company: string;
      role: string;
      period: string;
      achievements: string;
    }[];
    projects: {
      id: string;
      name: string;
      technologies: string;
      contribution: string;
    }[];
    skills: string;
    education: string;
    additional: string;
  };
}

export const getVacancies = (signal?: AbortSignal) =>
  request<Vacancy[]>("/vacancies", { signal });
export const getVacancy = (id: string) => request<Vacancy>(`/vacancies/${id}`);
export const createVacancy = (input: VacancyInput) =>
  request<Vacancy>("/vacancies", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const updateVacancy = (id: string, patch: Partial<VacancyInput>) =>
  request<Vacancy>(`/vacancies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
export const deleteVacancy = (id: string) =>
  request<void>(`/vacancies/${id}`, { method: "DELETE" });
// Для снимка выбираются только реальные резюме текущего пользователя из бэкенда.
export const getVacancyResumes = (signal?: AbortSignal) =>
  request<Resume[]>("/resumes", { signal });
export const getVacancySnapshot = (id: string, signal?: AbortSignal) =>
  request<VacancyResumeSnapshot>(`/vacancies/${id}/resume-snapshot`, {
    signal,
  });
