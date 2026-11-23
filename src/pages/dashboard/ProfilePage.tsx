import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { getProfile, updateProfile } from "../../api/profile";
import { errorMessage } from "../../api/client";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../router/paths";
import type { Profile } from "../../types";

type SaveStatus = "idle" | "saving" | "saved";

export default function ProfilePage() {
  const { user, updateProfileName } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [reloadKey, setReloadKey] = useState(0);
  const userName = user?.name ?? "";
  useEffect(() => {
    const controller = new AbortController();
    getProfile(controller.signal)
      .then((saved) => {
        if (controller.signal.aborted) return;
        setProfile(
          saved ?? { fullName: userName, specialization: "", about: "" },
        );
        setLoadError(null);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(errorMessage(error));
      });
    return () => controller.abort();
  }, [userName, reloadKey]);

  if (loadError)
    return (
      <div role="alert">
        <p className="mb-4 text-red-600">
          Не удалось загрузить профиль: {loadError}
        </p>
        <Button onClick={() => setReloadKey((key) => key + 1)}>
          Повторить
        </Button>
      </div>
    );
  if (!profile) return <p className="text-muted">Загрузка профиля…</p>;

  const change = (field: keyof Profile, value: string) => {
    setProfile((previous) =>
      previous ? { ...previous, [field]: value } : previous,
    );
    setStatus("idle");
    setSaveError(null);
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "saving") return;
    if (!profile.fullName.trim()) {
      setSaveError("Укажите имя и фамилию.");
      return;
    }
    setStatus("saving");
    setSaveError(null);
    try {
      const saved = await updateProfile(profile);
      setProfile(saved);
      updateProfileName(saved.fullName);
      setStatus("saved");
    } catch (error) {
      setStatus("idle");
      setSaveError(errorMessage(error));
    }
  };
  return (
    <>
      <PageHeader
        title="Ваш опыт — в одном месте"
        subtitle="Укажите имя, специализацию и описание опыта. Сохранённый профиль останется доступен после перезагрузки."
      />
      <section className="rounded-2xl border border-line bg-white p-6 sm:p-10">
        <form onSubmit={save}>
          <fieldset disabled={status === "saving"}>
            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
              <Input
                variant="outlined"
                label="Имя и фамилия"
                autoComplete="name"
                required
                maxLength={100}
                value={profile.fullName}
                onChange={(event) => change("fullName", event.target.value)}
              />
              <Input
                variant="outlined"
                label="Специализация"
                maxLength={255}
                value={profile.specialization}
                onChange={(event) =>
                  change("specialization", event.target.value)
                }
              />
            </div>
            <div className="mt-6">
              <Textarea
                label="О себе"
                rows={6}
                maxLength={2000}
                value={profile.about}
                onChange={(event) => change("about", event.target.value)}
              />
            </div>
          </fieldset>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" loading={status === "saving"}>
              Сохранить профиль
            </Button>
            <span
              role="status"
              aria-live="polite"
              className="text-sm text-muted"
            >
              {status === "saved"
                ? "Профиль сохранён"
                : status === "saving"
                  ? "Сохраняем…"
                  : "Изменения сохраняются по кнопке"}
            </span>
          </div>
          {saveError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {saveError}
            </p>
          )}
        </form>
        <p className="mt-5 text-xs text-muted">
          AI-редактор описания пока недоступен.
        </p>
        <div className="mt-7 flex flex-wrap gap-6 border-t border-line pt-5">
          <Link
            to={ROUTES.projects}
            className="font-medium text-primary underline"
          >
            Выбрать GitHub-проекты
          </Link>
          <Link
            to={ROUTES.resumes}
            className="font-medium text-primary underline"
          >
            Открыть резюме
          </Link>
        </div>
      </section>
    </>
  );
}
