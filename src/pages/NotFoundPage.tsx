import { Link } from 'react-router';
import { buttonClasses } from '../components/ui/Button';
import { ROUTES } from '../router/paths';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-page text-center">
      <h1 className="text-5xl font-bold text-ink">404</h1>
      <p className="text-muted">Такой страницы нет</p>
      <Link to={ROUTES.home} className={buttonClasses()}>
        На главную
      </Link>
    </main>
  );
}