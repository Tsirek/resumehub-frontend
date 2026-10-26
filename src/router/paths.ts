export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  app: '/app',
  profile: '/app/profile',
  resumes: '/app/resumes',
  resumeDetail: '/app/resumes/:id',
  projects: '/app/projects',
  adaptation: '/app/adaptation',
  responses: '/app/responses',
  vacancies: '/app/vacancies',
} as const;

/** Путь к конкретному резюме: /app/resumes/42 */
export const resumePath = (id: string) => `${ROUTES.resumes}/${id}`;

/** handle маршрута: заголовок для верхней панели кабинета */
export interface RouteHandle {
  title: string;
}