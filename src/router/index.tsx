import { createBrowserRouter, Navigate } from 'react-router';
import { AuthLayout } from '../components/layout/AuthLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProfilePage from '../pages/dashboard/ProfilePage';
import ResumesPage from '../pages/dashboard/ResumesPage';
import ResumeDetailPage from '../pages/dashboard/ResumeDetailPage';
import ProjectsPage from '../pages/dashboard/ProjectsPage';
import PlaceholderPage from '../pages/dashboard/PlaceholderPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES, type RouteHandle } from './paths';

export const router = createBrowserRouter([
  { path: ROUTES.home, element: <LandingPage /> },

  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
    ],
  },

  {
    path: ROUTES.app,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.profile} replace /> },
      {
        path: ROUTES.profile,
        element: <ProfilePage />,
        handle: { title: 'Карьерный профиль' } satisfies RouteHandle,
      },
      {
        path: ROUTES.resumes,
        element: <ResumesPage />,
        handle: { title: 'Резюме / Все резюме' } satisfies RouteHandle,
      },
      {
        path: ROUTES.resumeDetail,
        element: <ResumeDetailPage />,
        // Запасной заголовок; после загрузки страница подставит «Резюме / <название>»
        handle: { title: 'Резюме' } satisfies RouteHandle,
      },
      {
        path: ROUTES.projects,
        element: <ProjectsPage />,
        handle: { title: 'Проекты / Github' } satisfies RouteHandle,
      },
      {
        path: ROUTES.adaptation,
        element: <PlaceholderPage title="Адаптация" />,
        handle: { title: 'Адаптация' } satisfies RouteHandle,
      },
      {
        path: ROUTES.responses,
        element: <PlaceholderPage title="Отклики" />,
        handle: { title: 'Отклики' } satisfies RouteHandle,
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);