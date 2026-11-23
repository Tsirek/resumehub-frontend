import { CoreModeNotice } from "./CoreModeNotice";
import { NavLink } from "react-router";
import {
  Briefcase,
  ExternalLink,
  FileText,
  LogOut,
  User,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn, getInitials } from "../../lib/utils";
import { ROUTES } from "../../router/paths";
import { Logo } from "../ui/Logo";

// «Мой отчёт» и «Фоновые задачи» теперь вкладки внутри «Проекты»
const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: ROUTES.profile, label: "Мой Профиль", icon: User },
  { to: ROUTES.resumes, label: "Резюме", icon: FileText },
  { to: ROUTES.projects, label: "Проекты", icon: ExternalLink },
  { to: ROUTES.responses, label: "Отклики", icon: Briefcase },
];

export function Sidebar() {
  const { user, profileName, logout } = useAuth();
  const name = profileName ?? user?.name ?? "Пользователь";

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-white px-8 py-9">
      <Logo to={ROUTES.profile} />

      <nav
        aria-label="Основная навигация"
        className="mt-10 flex flex-col gap-3"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors -mx-4",
                isActive
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-field hover:text-ink",
              )
            }
          >
            <Icon aria-hidden className="size-6 shrink-0" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <CoreModeNotice />

      <div className="mt-auto border-t border-line pt-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-base font-semibold text-primary"
          >
            {getInitials(name)}
          </span>

          {/* min-w-0 позволяет тексту сжиматься внутри flex-строки, а не выпирать под кнопку */}
          <div className="min-w-0 flex-1">
            <p
              title={name}
              className="line-clamp-2 break-words text-sm font-semibold leading-tight text-ink"
            >
              {name}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted">
              Личное пространство
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Выйти из аккаунта"
            title="Выйти"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
          >
            <LogOut aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}