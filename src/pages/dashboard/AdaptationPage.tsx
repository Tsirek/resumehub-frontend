import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button';
import { fieldClass } from '../../components/ui/fieldStyles';
import { analyzeVacancy } from '../../api/adaptation';
import { getVacancy, updateVacancy } from '../../api/vacancies';
import { ROUTES } from '../../router/paths';
import type { AdaptationResult, Vacancy } from '../../types';

export function AdaptationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const vacancyId = params.get('vacancy');

  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<AdaptationResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Подгружаем вакансию из ?vacancy=
  useEffect(() => {
    if (!vacancyId) return;
    getVacancy(vacancyId)
      .then((v) => {
        setVacancy(v);
        setText(v.description);
      })
      .catch(() => setLoadError(true));
  }, [vacancyId]);

  // Анализ с задержкой, чтобы не дёргать API на каждый символ
  useEffect(() => {
    if (!text.trim()) {
      setResult(null);
      setAnalyzing(false);
      return;
    }
    let cancelled = false;
    setAnalyzing(true);
    const timer = setTimeout(() => {
      analyzeVacancy(text)
        .then((r) => !cancelled && setResult(r))
        .catch(() => !cancelled && setResult(null)) // BACKEND: показать ошибку анализа
        .finally(() => !cancelled && setAnalyzing(false));
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text]);

  // Сохраняем текст в вакансию при потере фокуса
  const handleBlur = () => {
    if (!vacancy || text === vacancy.description) return;
    updateVacancy(vacancy.id, { description: text })
      .then(setVacancy)
      .catch(() => setLoadError(true)); // BACKEND: отдельное сообщение об ошибке сохранения
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Выделите релевантный опыт</h1>
      <p className="mt-3 text-sm text-muted">Сравнение с вакансией без выдуманных данных.</p>

      {loadError && (
        <p role="alert" className="mt-4 text-sm text-red-600">Не удалось загрузить или сохранить вакансию.</p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
        <section className="self-start rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">{vacancy?.position ?? 'Новая вакансия'}</h2>
          <label htmlFor="vacancy-text" className="mt-5 mb-2 block text-sm text-muted">
            Текст вакансии
          </label>
          <textarea
            id="vacancy-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            rows={9}
            className={`${fieldClass} resize-y`}
          />
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm" aria-live="polite" aria-busy={analyzing}>
          <h2 className="text-xl font-semibold text-ink">Пример предложений</h2>

          {!result ? (
            <p className="mt-6 text-sm text-muted">
              {analyzing ? 'Сравниваем…' : 'Вставьте текст вакансии, и здесь появится сравнение.'}
            </p>
          ) : (
            <>
              <ul className="mt-6">
                {result.requirements.map((req) => (
                  <li key={req.label} className="flex items-center justify-between gap-4 border-b border-line py-3 text-sm">
                    <span className="text-ink">{req.label}</span>
                    <span className={req.matched ? 'text-xs text-emerald-600' : 'text-xs text-muted'}>
                      {req.matched ? 'Есть в проекте' : 'Уточнить опыт'}
                    </span>
                  </li>
                ))}
              </ul>

              {result.advice && (
                <div className="mt-8 rounded-xl border border-brand/20 bg-brand/5 p-5">
                  <h3 className="font-semibold text-brand">Начните с {result.advice.projectName}</h3>
                  <p className="mt-2 text-xs text-ink">{result.advice.text}</p>
                  <Button type="button" className="mt-4 w-full" onClick={() => navigate(ROUTES.projects)}>
                    Редактировать проекты
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}