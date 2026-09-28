export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  app: '/app',
  profile: '/app/profile',
  resumes: '/app/resumes',
  projects: '/app/projects',
  adaptation: '/app/adaptation',
  responses: '/app/responses',
} as const;

/** handle маршрута: заголовок для верхней панели кабинета */
export interface RouteHandle {
  title: string;
}