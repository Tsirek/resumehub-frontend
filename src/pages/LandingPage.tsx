import { Link } from "react-router";
import { ArrowRight, Star } from "lucide-react";
import { ResumePreview } from "../components/landing/ResumePreview";
import { buttonClasses } from "../components/ui/buttonStyles";
import { Logo } from "../components/ui/Logo";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import { ROUTES } from "../router/paths";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const ctaTo = isAuthenticated ? ROUTES.resumes : ROUTES.register;

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="border-b border-line bg-white">
        <div className="flex h-22 items-center justify-between px-7">
          <Logo />
          <nav className="flex items-center gap-5">
            <Link
              to={isAuthenticated ? ROUTES.profile : ROUTES.login}
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              {isAuthenticated ? "Кабинет" : "Войти"}
            </Link>
            <Link to={ctaTo} className={buttonClasses({ size: "lg" })}>
              Создать резюме <ArrowRight aria-hidden className="size-5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="grid flex-1 items-center gap-12 px-7 py-16 lg:grid-cols-2 lg:gap-20 lg:px-16 xl:px-28">
        <section>
          <span className="inline-flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 font-medium text-primary">
            <Star aria-hidden className="size-5" />
            Ваш опыт и проекты в одном месте
          </span>

          <h1 className="mt-6 text-5xl leading-tight text-black sm:text-6xl">
            Резюме, которое <span className="text-primary">рассказывает о вас</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted">
            Соберите опыт и GitHub-проекты, подготовьте резюме в PDF и ведите отклики. Формулировки и личный вклад остаются под вашим контролем.
          </p>

          <Link
            to={ctaTo}
            className={cn(buttonClasses({ size: "lg" }), "mt-8 px-10")}
          >
            Создать резюме бесплатно{" "}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </section>

        <div className="w-full max-w-[720px] lg:justify-self-end">
          <ResumePreview />
        </div>
      </main>
    </div>
  );
}
