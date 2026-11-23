export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  app: "/app",
  profile: "/app/profile",
  resumes: "/app/resumes",
  resumeDetail: "/app/resumes/:id",
  projects: "/app/projects",
  report: "/app/report",
  tasks: "/app/tasks",
  adaptation: "/app/adaptation",
  responses: "/app/responses",
  vacancies: "/app/vacancies",
} as const;

export type ProjectsTab = "repositories" | "report" | "tasks";

export const projectsTabPath = (tab: ProjectsTab) =>
  tab === "repositories" ? ROUTES.projects : `${ROUTES.projects}?tab=${tab}`;

export const resumePath = (id: string) => `${ROUTES.resumes}/${id}`;

/** handle маршрута: заголовок для верхней панели кабинета */
export interface RouteHandle {
  title: string;
}