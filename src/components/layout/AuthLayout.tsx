import { Link, Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/auth';
import { ROUTES } from '../../router/paths';
import { Logo } from '../ui/Logo';

export function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // Авторизованному пользователю нечего делать на страницах входа/регистрации
  if (isAuthenticated) return <Navigate to={ROUTES.profile} replace />;

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="flex h-22 items-center justify-between border-b border-line bg-white px-7">
        <Logo />
        <Link to={ROUTES.home} className="text-xl text-muted transition-colors hover:text-ink">
          Главная страница
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[530px] rounded-2xl border border-line bg-white p-9 shadow-[8px_10px_0_0_rgba(30,36,51,0.06)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}