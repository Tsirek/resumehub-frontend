import { NavLink } from 'react-router';
import { Briefcase, ExternalLink, FileText, LogOut, Star, User, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/auth';
import { cn, getInitials } from '../../lib/utils';
import { ROUTES } from '../../router/paths';
import { Logo } from '../ui/Logo';

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: ROUTES.profile, label: 'Мой Профиль', icon: User },
  { to: ROUTES.resumes, label: 'Резюме', icon: FileText },
  { to: ROUTES.projects, label: 'Проекты', icon: ExternalLink },
  { to: ROUTES.adaptation, label: 'Адаптация', icon: Star },
  { to: ROUTES.responses, label: 'Отклики', icon: Briefcase },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const name = user?.name ?? 'Пользователь';

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-white px-8 py-9">
      <Logo to={ROUTES.profile} />

      <nav aria-label="Основная навигация" className="mt-10 flex flex-col gap-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors -mx-4',
                isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-field hover:text-ink',
              )
            }
          >
            <Icon aria-hidden className="size-6 shrink-0" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-line pt-5">
        <div className="flex items-center gap-3">
          <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            {getInitials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight text-ink">{name}</p>
            <p className="text-[10px] text-muted">Личное пространство</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Выйти из аккаунта"
            className="rounded-md p-1 text-muted hover:bg-field hover:text-ink"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}