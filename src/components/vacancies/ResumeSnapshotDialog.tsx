import { useEffect, useState } from "react";
import {
  getVacancySnapshot,
  type VacancyResumeSnapshot,
} from "../../api/vacancies";
import { errorMessage } from "../../api/client";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";

export function ResumeSnapshotDialog({
  vacancyId,
  onClose,
}: {
  vacancyId: string;
  onClose: () => void;
}) {
  const [snapshot, setSnapshot] = useState<VacancyResumeSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    getVacancySnapshot(vacancyId, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setSnapshot(value);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, [vacancyId]);
  const content = snapshot?.content;
  return (
    <Dialog
      open
      onClose={onClose}
      labelledBy="vacancy-snapshot-title"
      className="max-w-2xl"
    >
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <h2 id="vacancy-snapshot-title" className="text-xl font-semibold">
          {snapshot ? snapshot.title : "Снимок резюме"}
        </h2>
        <p className="mt-2 text-xs text-muted">
          Сохранённая копия на момент прикрепления к вакансии.
        </p>
        {error && (
          <p role="alert" className="mt-5 text-red-600">
            {error}
          </p>
        )}
        {!content && !error && <p className="mt-5">Загрузка…</p>}
        {content && (
          <div className="mt-6 space-y-5 break-words text-sm">
            <section>
              <h3 className="font-semibold">{content.contacts.fullName}</h3>
              <p>{content.contacts.position}</p>
              <p>
                {[content.contacts.email, content.contacts.location]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </section>
            {content.about && (
              <section>
                <h3 className="font-semibold">О себе</h3>
                <p className="mt-2 whitespace-pre-wrap">{content.about}</p>
              </section>
            )}
            {content.experience.length > 0 && (
              <section>
                <h3 className="font-semibold">Опыт</h3>
                {content.experience.map((item) => (
                  <div key={item.id} className="mt-3">
                    <p className="font-medium">
                      {[item.company, item.role, item.period]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="whitespace-pre-wrap">{item.achievements}</p>
                  </div>
                ))}
              </section>
            )}
            {content.projects.length > 0 && (
              <section>
                <h3 className="font-semibold">Проекты</h3>
                {content.projects.map((item) => (
                  <div key={item.id} className="mt-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted">{item.technologies}</p>
                    <p className="whitespace-pre-wrap">{item.contribution}</p>
                  </div>
                ))}
              </section>
            )}
            {(
              [
                ["Навыки", content.skills],
                ["Образование", content.education],
                ["Дополнительно", content.additional],
              ] as const
            )
              .filter(([, text]) => text)
              .map(([title, text]) => (
                <section key={title}>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 whitespace-pre-wrap">{text}</p>
                </section>
              ))}
          </div>
        )}
        <Button className="mt-6" variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </Dialog>
  );
}
