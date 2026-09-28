import { Link } from 'react-router';
import { ROUTES } from '../../router/paths';

export function Logo({ to = ROUTES.home }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-3" aria-label="ResumeHub — на главную">
      <span className="flex h-14 w-7 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
        r.
      </span>
      <span className="text-lg font-bold text-ink">resumehub</span>
    </Link>
  );
}